<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="../assets/logos/logo.png?raw=true" alt="Project logo"></a>
</p>

<h3 align="center">Bragibooks</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/djdembeck/bragibooks.svg)](https://github.com/djdembeck/bragibooks/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/djdembeck/bragibooks.svg)](https://github.com/djdembeck/bragibooks/pulls)
[![License](https://img.shields.io/github/license/djdembeck/bragibooks)](https://github.com/djdembeck/bragibooks/blob/develop/LICENSE)
[![Docker](https://github.com/djdembeck/bragibooks/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/djdembeck/bragibooks/actions/workflows/docker-publish.yml)
[![Docker Pulls](https://img.shields.io/docker/pulls/djdembeck/bragibooks)](https://hub.docker.com/r/djdembeck/bragibooks)
[![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/djdembeck/bragibooks)](https://hub.docker.com/r/djdembeck/bragibooks)
[![Docker Image Version (latest by date)](https://img.shields.io/docker/v/djdembeck/bragibooks)](https://hub.docker.com/r/djdembeck/bragibooks)
[![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/djdembeck/bragibooks)](https://www.codefactor.io/repository/github/djdembeck/bragibooks)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

</div>

---

<p align="center"> An audiobook library cleanup & management app, written as a frontend for web use of <a href="https://github.com/djdembeck/m4b-merge">m4b-merge</a>.
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)
- [Built Using](#built_using)
- [Contributing](../CONTRIBUTING.md)
- [Authors](#authors)
- [Contributors](#contributors)

## 🧐 About <a name = "about"></a>

**Bragi - (god of poetry in [Norse mythology](https://en.wikipedia.org/wiki/Bragi)):**
Bragibooks provides a minimal and straightforward webserver that you can run remotely or locally on your server. Since Bragibooks runs in a docker, you no longer need to install dependencies on whichever OS you are on. You can

Some basics of what Bragi does:
- Merge multiple files
- Convert mp3(s)
- Cleanup existing data on an m4b file
- More features on [m4b-merge's help page](https://github.com/djdembeck/m4b-merge)

### Screens

Folder/file selection             |  ASIN input
:-------------------------:|:-------------------------:
![file-selection](../assets/screens/file_picker.png)  |  ![asin-auto-search](../assets/screens/auto_search_panel.png)

Folder/file selection             |  Post-proccess overview
:-------------------------:|:-------------------------:
![asin-custom-search](../assets/screens/custom_search.png)  |  ![post-process](../assets/screens/processing_panel.png)

## 🏁 Getting Started <a name = "getting_started"></a>

You can either install this project directly or run it prepackaged in Docker.

### Prerequisites

#### Docker
- All prerequisites are included in the image.

#### Direct (Gunicorn)
- You'll need to install m4b-tool and it's dependants from [the project's readme](https://github.com/sandreas/m4b-tool#installation)
- Run `uv sync` from this project's directory (install [uv](https://github.com/astral-sh/uv) if you don't have it).

### Installing

#### Docker
To run Bragibooks as a container, you need to pass some paramaters in the run command:

The container entrypoint accepts a mode argument that controls what it runs:

  | Mode | Description |
  | :----: | --- |
  | `prod` | Gunicorn production server (default) |
  | `worker` | Task queue worker — can be run in a separate container |
  | `dev` | Django development server |

  | Parameter | Function |
  | :----: | --- |
  | `-v /path/to/input:/input` | Input folder |
  | `-v /path/to/output:/output` | Output folder |
  | `-v /appdata/bragibooks/config:/config` | Persistent config storage |
  | `-p 8000:8000/tcp` | Port for your browser to use |
  | `-e LOG_LEVEL=WARNING` | Choose any [logging level](https://www.loggly.com/ultimate-guide/python-logging-basics/) |
  | `-e DEBUG=False` | Turn django debug on or off (default False) |
  | `-e UID=99` | User ID to run the container as (default 99)|
  | `-e GID=100` | Group ID to run the container as (default 100)|
  | `-e RUN_WORKER=true` | Run the task queue worker inside this container (default false)|
  | `-e CSRF_TRUSTED_ORIGINS=https://bragibooks.mydomain.com` | Domains to trust if bragibooks is hosted behind a reverse proxy. |


Which all together should look like:

	docker run --rm -d --name bragibooks -v /path/to/input:/input -v /path/to/output:/output -v /appdata/bragibooks/config:/config -p 8000:8000/tcp -e LOG_LEVEL=WARNING -e RUN_WORKER=true <your-username>/bragibooks:main prod

Or run the web server and task worker in separate containers:

	docker run --rm -d --name bragibooks -v /path/to/input:/input -v /path/to/output:/output -v /appdata/bragibooks/config:/config -p 8000:8000/tcp -e LOG_LEVEL=WARNING <your-username>/bragibooks:main prod
	docker run --rm -d --name bragibooks-worker -v /path/to/input:/input -v /path/to/output:/output -v /appdata/bragibooks/config:/config -e LOG_LEVEL=WARNING <your-username>/bragibooks:main worker

## Docker Compose

### Single container (web + worker)
```yaml
services:
  bragi:
    image: acetugboat/bragibooks:main
    container_name: bragibooks
    command: prod
    environment:
      - CSRF_TRUSTED_ORIGINS=https://bragibooks.mydomain.com
      - LOG_LEVEL=INFO
      - DEBUG=False
      - UID=1000
      - GID=1000
      - RUN_WORKER=true
    volumes:
      - path/to/config:/config
      - path/to/input:/input
      - path/to/output:/output
      - path/to/done:/done
    ports:
      - 8000:8000
    restart: unless-stopped
```

### Separate containers (web + worker)
```yaml
services:
  bragi:
    image: acetugboat/bragibooks:main
    container_name: bragibooks
    command: prod
    environment:
      - CSRF_TRUSTED_ORIGINS=https://bragibooks.mydomain.com
      - LOG_LEVEL=INFO
      - DEBUG=False
      - UID=1000
      - GID=1000
    volumes:
      - path/to/config:/config
      - path/to/input:/input
      - path/to/output:/output
      - path/to/done:/done
    ports:
      - 8000:8000
    restart: unless-stopped

  worker:
    image: acetugboat/bragibooks:main
    container_name: bragibooks-worker
    command: worker
    environment:
      - LOG_LEVEL=INFO
      - UID=1000
      - GID=1000
    volumes:
      - path/to/config:/config
      - path/to/input:/input
      - path/to/output:/output
      - path/to/done:/done
    restart: unless-stopped
```


#### Direct Build (Gunicorn)
  - Install dependencies:
    ```
    uv sync
    ```
  - Copy static assets to project folder:
    ```
    python manage.py collectstatic
    ```
  - Create the database:
    ```
    python manage.py migrate
    ```
  - Run the task queue worker:
    ```
    python manage.py db_worker
    ```
  - Run the web server:
    ```
    gunicorn bragibooks_proj.wsgi \
    --bind 0.0.0.0:8000 \
    --timeout 1200 \
    --worker-tmp-dir /dev/shm \
    --workers=2 \
    --threads=4 \
    --worker-class=gthread \
    --reload \
    --enable-stdio-inheritance
    ```

## 🎈 Usage <a name="usage"></a>

The Bragibooks process is a linear, 3 step process:
1. __Select input__ - Use the file multi-select box to choose which books to process this session, and click next.
2. __Submit ASINs__ - Bragi will auto search for the audiobook data on [Audible.com](https://www.audible.com) (US only). If the data found is incorrect you can do a custom search to find the correct title and then submit for processing.
3. Wait for books to finish processing. This can take anywhere from 10 seconds to a few hours, depending on the number and type of files submitted. This will be done in the background.
4. __Books page__ - Page where you can see the data assigned to each book after it has finished processing. You can also check the status of the books still being processed.

## ⛏️ Built Using <a name = "built_using"></a>

- [Django](https://www.djangoproject.com/) - Server/web framework
- [django-tasks-db](https://github.com/RealOrangeOne/django-tasks-db) - Database-backed task queue worker
- [Bulma](https://bulma.io/) - Frontend CSS framework
- [audnexus](https://github.com/laxamentumtech/audnexus) - API backend for metadata
- [m4b-merge](https://github.com/djdembeck/m4b-merge) - File merging and tagging

## ✍️ Authors <a name = "authors"></a>
  <img src="https://github.com/djdembeck.png?size=100"/>
  
  [@djdembeck](https://github.com/djdembeck) - Idea & Initial work

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://koby.huckabee.dev"><img src="https://avatars.githubusercontent.com/u/14910857?v=4?s=100" width="100px;" alt="Koby Huckabee"/><br /><sub><b>Koby Huckabee</b></sub></a><br /><a href="https://github.com/djdembeck/bragibooks/commits?author=AceTugboat" title="Code">💻</a> <a href="#ideas-AceTugboat" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/djdembeck/bragibooks/commits?author=AceTugboat" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://pilabor.com"><img src="https://avatars.githubusercontent.com/u/2050604?v=4?s=100" width="100px;" alt="Andreas"/><br /><sub><b>Andreas</b></sub></a><br /><a href="#tool-sandreas" title="Tools">🔧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!