# System imports
import logging
import os
from pathlib import Path

import requests
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.http import HttpRequest, HttpResponseBadRequest, JsonResponse
from django.shortcuts import redirect, render
from django.views.generic import TemplateView, View
# core merge logic:
from m4b_merge import helpers

# Import Merge functions for django
from utils.merge import create_book
# Import Search tools
from utils.search_tools import ScoreTool, SearchTool

# Forms import
from .forms import SettingForm, LoginForm, RegisterForm
# Models import
from .models import Book, Setting, StatusChoices
from .tasks import m4b_merge_task

# Get an instance of a logger
logger = logging.getLogger(__name__)

# If using docker, default to /input folder, else $USER/input
# This is still used by DirectoryListAPI in api.py
if Path('/downloads').is_dir():
    rootdir = "/downloads"
else:
    rootdir = f"{str(Path.home())}/input"


class ImportView(LoginRequiredMixin, TemplateView):
    template_name = "importer.html"

    def get_context_data(self, **kwargs):
        root = Path(rootdir)
        contents = sorted(root.iterdir(), key=os.path.getmtime, reverse=True) if root.is_dir() else []
        return {"contents": contents}

    def post(self, request):
        # Redirect if this is a new session
        existing_settings = Setting.objects.first()
        if not existing_settings:
            logger.debug("No settings found, returning to settings page")
            messages.error(
                request, "Settings must be configured before import"
            )
            return redirect("setting")

        if not (input_dir := request.POST.getlist('input_dir')):
            messages.error(request, "You must select content to import")
            return redirect("home")

        request.session['input_dir'] = input_dir
        return redirect("match")


class MatchView(LoginRequiredMixin, TemplateView):
    template_name = "match.html"

    def get(self, request, **kwargs):
        # Redirect if this is a new session
        if 'input_dir' not in request.session:
            logger.debug("No session data found, returning to import page")
            return redirect("home")

        return render(request, self.template_name, self.get_context_data())

    def get_context_data(self, **kwargs) -> dict:
        # Check if any of these inputs exist in our DB
        # If so, prepopulate their asins
        context = []
        for this_dir in self.request.session['input_dir']:
            try:
                book = Book.objects.get()
            except Book.DoesNotExist:
                context.append({'src_path': this_dir})
            else:
                context.append({'src_path': this_dir, 'asin': book.asin})

        return {"context": context}

    def post(self, request: HttpRequest):
        created_books = False
        for key, asin in request.POST.items():
            
            if key == "csrfmiddlewaretoken":
                continue

            # Check for validation errors
            if len(errors := Book.objects.book_asin_validator(asin)) > 0:
                for k, v in errors.items():
                    messages.error(request, v)
                return redirect("match")

            if not (existing_settings := Setting.objects.first()):
                messages.error(request, "Settings not set")
                return redirect("setting")

            # Check that asin actually returns data from audible
            try:
                helpers.validate_asin(existing_settings.api_url, asin)
            except ValueError:
                messages.error(request, "Bad ASIN: " + asin)
                return redirect("match")
            
            original_path = Path(key)
            if not helpers.get_directory(original_path):
                messages.error(request, f"No supported files in {original_path}")
                continue

            logger.info(f"Making models and merging files for: {original_path}")

            book = create_book(asin, original_path)
            created_books = True

            logger.info(f"Adding book {book} to processing queue")
            m4b_merge_task.enqueue(asin)
        
        if created_books:
            return redirect("books")
        else:
            return redirect("match")


class AsinSearch(LoginRequiredMixin, View):
    def get(self, request):
        accepted_keywords = ["media_dir", "title", "author", "keywords"]

        if any(key not in accepted_keywords for key in request.GET.keys()):
            return HttpResponseBadRequest(
                f"'{', '.join(request.GET.keys() -  accepted_keywords)}' are not valid parameters. \
                Valid search parameters are {accepted_keywords}"
            )

        return self.search(
            request.GET.get("media_dir"),
            request.GET.get("title"),
            request.GET.get("author"),
            request.GET.get("keywords")
        )

    def search(self, media_dir: str = "", title: str = "", author: str = "", keywords: str = "") -> JsonResponse:
        """
            Search for an album.
        """
        # Instantiate search helper
        search_helper = SearchTool(
            filename=media_dir, title=title, author=author, keywords=keywords)

        # Call search API
        results = self.call_search_api(search_helper)

        # Write search result status to log
        if not results:
            logger.warn(
                f'No results found for query {search_helper.normalizedFileName}')
            return JsonResponse([], safe=False)

        logger.debug(
            f'Found {len(results)} result(s) for query "{search_helper.normalizedFileName}"')

        results = self.process_results(search_helper, results)

        return JsonResponse(results, safe=False)

    @staticmethod
    def process_results(helper: SearchTool, result) -> list[dict[str, str | int]]:
        """
            Process the results from the API call.
        """
        scored_results = []
        # Walk the found items and gather extended information
        logger.debug(msg="Search results")
        for index, result_dict in enumerate(result):
            score_helper = ScoreTool(
                helper, index, settings.LANGUAGE_CODE, result_dict)
            scored_results.append(score_helper.run_score_book())

            # Print separators for easy reading
            if index <= len(result):
                logger.debug("-" * 35)

        return sorted(scored_results, key=lambda inf: inf['score'], reverse=True)

    @staticmethod
    def call_search_api(helper: SearchTool):
        '''
            Builds URL then calls API, returns the JSON to helper function.
        '''
        query = helper.build_search_args()
        search_url = helper.build_url(query)
        request = requests.get(search_url)
        return helper.parse_api_response(request.json())


class BookListView(LoginRequiredMixin, TemplateView):
    template_name = "book_tabs.html"

    def get(self, request, **kwargs):
        done_books = Book.objects.filter(status__status=StatusChoices.DONE).order_by(
            '-created_at')
        processing_books = Book.objects.filter(
            status__status=StatusChoices.PROCESSING).order_by(
            '-created_at')
        error_books = Book.objects.filter(status__status=StatusChoices.ERROR).order_by(
            '-created_at')

        return render(request, self.template_name, self.get_context_data(
            done_books=done_books, processing_books=processing_books, error_books=error_books))

    def get_context_data(self, **kwargs) -> dict:
        context = {"default_view": "done"}

        redirect_url = self.request.META.get('HTTP_REFERER')
        if 'match' in redirect_url:
            context.update({"default_view": "processing"})

        for key, books in filter(lambda item: 'books' in item[0], kwargs.items()):
            context.update(
                {key: list(zip(books, self.calcBookLength(list(books))))})

        return context

    def calcBookLength(self, books: list[Book]) -> list[str]:
        # Calculate time object into sentence
        length_arr = []
        for book in books:
            d = int(
                timedelta(
                    minutes=book.runtime_length_minutes
                ).total_seconds()
            )
            book_length_calc = (
                f'{d//3600} hrs and {(d//60)%60} minutes'
            )
            length_arr.append(book_length_calc)
        return length_arr


class SettingView(LoginRequiredMixin, TemplateView):
    template_name = "setting.html"

    def get_context_data(self, **kwargs):
        existing_settings = Setting.objects.first()
        default_data = {
            'api_url': 'https://api.audnex.us',
            'archive_directory': '',
            'input_directory': '/input',
            'num_cpus': 0,
            'output_directory': '/output',
            'output_scheme': 'author/title/title - subtitle'
        }
        if existing_settings:
            form = SettingForm(instance=existing_settings)
        else:
            form = SettingForm(initial=default_data)
        all_settings = Setting.objects.first()

        context = {
            "form": form,
            "settings": all_settings,
        }
        return context

    def post(self, request):
        existing_settings = Setting.objects.first()

        form = SettingForm(request.POST)
        if form.is_valid():
            paths_to_check = [
                'input_directory',
                'output_directory'
            ]
            form_data = form.cleaned_data

            # Check file path validity
            for path in paths_to_check:
                errors = Setting.objects.file_path_validator(form_data[path])
                if len(errors) > 0:
                    for k, v in errors.items():
                        messages.error(request, v)
                    return redirect("setting")
            if not existing_settings:
                setting = Setting.objects.create(
                    api_url=form_data['api_url'],
                    archive_directory=form_data['archive_directory'],
                    input_directory=form_data['input_directory'],
                    num_cpus=form_data['num_cpus'],
                    output_directory=form_data['output_directory'],
                    output_scheme=form_data['output_scheme']
                )
                setting.save()
            else:
                es = existing_settings
                es.api_url = form_data['api_url']
                es.archive_directory = form_data['archive_directory']
                es.input_directory = form_data['input_directory']
                es.num_cpus = form_data['num_cpus']
                es.output_directory = form_data['output_directory']
                es.output_scheme = form_data['output_scheme']
                es.save()

            return redirect("home")

        messages.error(request, "Form is invalid")
        return redirect("setting")


class LoginView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('home')

        if not User.objects.filter(is_superuser=True).exists():
            form = RegisterForm()
            template_name = 'register.html'
        else:
            form = LoginForm()
            template_name = 'login.html'
        return render(request, template_name, {'form': form, 'app_name': settings.APP_NAME})

    def post(self, request):
        if not User.objects.filter(is_superuser=True).exists():
            form = RegisterForm(request.POST)
            if form.is_valid():
                user = form.save(commit=False)
                user.set_password(form.cleaned_data['password'])
                user.is_superuser = True
                user.is_staff = True
                user.save()
                return redirect('login')

            return render(request, 'register.html', {'form': form, 'app_name': settings.APP_NAME})

        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('home')
            else:
                form.add_error(None, 'Invalid username or password')
        return render(request, 'login.html', {'form': form, 'app_name': settings.APP_NAME})


class LogoutView(View):
    def get(self, request):
        logout(request)
        return redirect('login')
