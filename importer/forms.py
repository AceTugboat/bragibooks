from django import forms
from .models import Setting

from django.contrib.auth.models import User

class RegisterForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    password_confirm = forms.CharField(widget=forms.PasswordInput, label="Confirm Password")

    class Meta:
        model = User
        fields = ['username', 'password']

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password_confirm = cleaned_data.get("password_confirm")

        if password and password_confirm and password != password_confirm:
            self.add_error('password_confirm', "Passwords do not match")

        return cleaned_data

class LoginForm(forms.Form):
    username = forms.CharField(max_length=100)
    password = forms.CharField(widget=forms.PasswordInput)


class SettingForm(forms.ModelForm):
    class Meta:
        model = Setting
        fields = (
            'api_url',
            'archive_directory',
            'input_directory',
            'num_cpus',
            'output_directory',
            'output_scheme'
        )
        labels = {
            'api_url': 'Custom API URL',
            'archive_directory': 'Directory for copy of original input files. Leave blank to disable moving.',
            'input_directory': 'Input directory path',
            'num_cpus': 'Number of CPUs to use (0 will use all available)',
            'output_directory': 'Output directory path',
            'output_scheme': 'Output path format'
        }
        widgets = {
            'api_url': forms.URLInput(attrs={'class': 'input is-fullwidth'}),
            'archive_directory': forms.TextInput(attrs={'class': 'input is-fullwidth', "required": False}),
            'input_directory': forms.TextInput(attrs={'class': 'input is-fullwidth'}),
            'num_cpus': forms.NumberInput(attrs={'class': 'input is-fullwidth'}),
            'output_directory': forms.TextInput(attrs={'class': 'input is-fullwidth'}),
            'output_scheme': forms.TextInput(attrs={'class': 'input is-fullwidth'}),
        }
