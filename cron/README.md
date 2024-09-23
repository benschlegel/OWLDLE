# cron

Cron runner for OWLDLE that can be run as a self-hosted container.

To build, run
```bash
docker build -t <your-container-name> --squash .
```

You can then run the container with
```bash
docker compose up
```
Or deploy it to dockerhub/deploy it on portainer (or wherever else you want to host it.)
