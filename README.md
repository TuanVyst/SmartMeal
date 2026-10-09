# SmartMeal

SmartMeal is an automated meal planning and dietary management platform that combines computer vision for ingredient detection, personalized nutrition calculation, and cross-platform clients for mobile and web.

[![CI/CD Pipeline](https://github.com/TuanVyst/SmartMeal/actions/workflows/main.yml/badge.svg)](https://github.com/TuanVyst/SmartMeal/actions/workflows/main.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.txt)

---

## Architecture Overview

```
                      +-------------------+
                      |   Gateway API     |
                      |  (api.ocgi.space) |
                      +---------+---------+
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
   +-------------------+                 +-------------------+
   |   smartmeal-api   |                 | smartmeal-predict |
   |     (.NET 8)      +---------------->+  (Flask + ONNX)   |
   |      Port 80      |   /predict      |     Port 8000     |
   +---------+---------+                 +-------------------+
             |
             v
   +-------------------+
   |    PostgreSQL     |
   +-------------------+
```

---

## Repository Structure

```
SmartMeal/
├── .github/workflows/main.yml    # CI/CD pipeline (tagging, builds, deployment)
├── AGENTS.md                     # AI agents and coding guidelines
├── LICENSE.txt                   # MIT License
├── README.md                     # Main project documentation
├── docs/                         # Technical documentation
│   ├── architecture.md           # Deep dive into system components
│   └── api.md                    # Core API reference and contracts
├── Server/                       # .NET 8 Web API backend
│   ├── PresentationLayer/        # Controllers, Swagger, Program.cs
│   ├── Service/                  # Business logic services
│   ├── Repository/               # Data repositories
│   ├── BusinessObject/           # Domain models and DTOs
│   └── DataAccessLayer/          # Entity Framework Core DbContext & Migrations
├── AI/                           # Python ONNX object detection microservice
│   ├── src/smartmeal_predict/    # Flask application and predictor
│   ├── pyproject.toml            # uv/pip dependencies
│   └── Dockerfile                # AI container build configuration
├── Client/                       # React 19 + Vite web frontend
├── ClientMobile/                 # Flutter mobile application
├── infra/k8s/                    # Kubernetes manifests (Gateway API & Kustomize)
│   ├── base/                     # Base resources for API and Predict services
│   └── overlay/prod/             # Production environment overlay
└── scripts/                      # Developer utility scripts
    └── bump-tag.ps1              # Local tag bump utility for Windows/PowerShell
```

---

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL 15+](https://www.postgresql.org/)
- [Python 3.11+](https://www.python.org/) and [`uv`](https://docs.astral.sh/uv/)
- [Node.js 20+](https://nodejs.org/)
- [Flutter 3.x](https://flutter.dev/)

### 1. Server (.NET 8)
```bash
cd Server
# Configure ConnectionStrings:DefaultConnection in appsettings.json or via environment variables
dotnet ef database update --project DataAccessLayer --startup-project PresentationLayer
dotnet run --project PresentationLayer
```
Swagger UI available at `http://localhost:5000/swagger`.

### 2. AI Inference Service (Python)
```bash
cd AI
uv sync
uv run python src/smartmeal_predict/app.py
```
Health endpoint accessible at `http://localhost:8000/health`.

### 3. Web Client (React + Vite)
```bash
cd Client
npm install
npm run dev
```
Client runs at `http://localhost:5173`.

### 4. Mobile Client (Flutter)
```bash
cd ClientMobile
flutter pub get
flutter run
```

---

## Deployment & CI/CD

Deployment is automated via GitHub Actions in `.github/workflows/main.yml`:

1. **Tagging (`tag`)**: Automatically increments the semantic version on branch pushes using Conventional Commits (`paulhatch/semantic-version`) and changed paths (`dorny/paths-filter`). Direct tag pushes are preserved.
2. **Build (`build`)**: Builds and pushes Docker images for both `smartmeal-server` and `smartmeal-predict` to GHCR tagged with the release version and `latest`.
3. **Deployment (`deploy`)**: Runs `kustomize edit set image` on `infra/k8s/overlay/prod/kustomization.yaml` and commits the updated tags to `master`.

For developer commit rules, refer to [AGENTS.md](AGENTS.md).

---

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.
