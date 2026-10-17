# Practical 11: Docker and Docker Compose

## Start the full stack

Verify Docker Desktop is running, then execute this command from the project
root:

```powershell
docker compose up --build
```

The Compose stack contains:

- `frontend`: builds the React application and serves it on port `5173`
- `backend`: runs the Express API on port `5000`
- `mongodb`: runs MongoDB on port `27017`

Open `http://localhost:5173` in a browser. The browser reaches the API
through `http://localhost:5000`. The backend reaches MongoDB through the
internal Compose hostname `mongodb`; `localhost` inside the backend container
would refer to the backend container itself.

MongoDB data is persisted in the named `mongodb-data` volume. The services
share the `app-network` bridge network. The backend waits for MongoDB's
health check before starting.

## Verify containers

In another terminal, run:

```powershell
docker compose ps
docker ps
```

Stop the services with `Ctrl+C` or:

```powershell
docker compose down
```

Remove the MongoDB data volume only when a clean database is required:

```powershell
docker compose down -v
```

`EXPOSE` documents the port used inside an image. The `ports` entries in
`docker-compose.yml` publish those container ports to the host.

The `.dockerignore` files exclude dependencies, environment files, Git data,
and build output from image build contexts. Dependencies are installed inside
the images rather than copied from the host. The frontend uses a multi-stage
build so the final image contains the built application and only the runtime
files needed by Vite preview.
