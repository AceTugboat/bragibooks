from django.tasks import task

from utils.merge import run_m4b_merge


@task()
def m4b_merge_task(asin: str):
    run_m4b_merge(asin=asin)
