package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/joho/godotenv"

	"backend/migrations"
	"backend/src/auth"
	"backend/src/db"

	"backend/docs" // generated swagger docs
)

// Simple Auth API.
//
//	@title           Simple Auth API
//	@version         1.0
//	@description     Hackathon auth API: register, login, and me with JWT. All endpoints return JSON.
//	@host            localhost:3000
//	@BasePath        /
//
//	@securityDefinitions.apikey BearerAuth
//	@in                         header
//	@name                       Authorization
//	@description                Type "Bearer {token}" (token from /register or /login).
func main() {
	godotenv.Load() // ignore error, env vars may already be set

	db.Connect()
	if err := migrations.Run(db.DB); err != nil {
		log.Fatal("failed to run migrations: ", err)
	}

	app := fiber.New()

	app.Post("/register", auth.Register)
	app.Post("/login", auth.Login)
	app.Get("/me", auth.AuthMiddleware, auth.Me)

	// Swagger UI at /swagger (spec served from /swagger/doc.json)
	app.Get("/swagger/doc.json", func(c fiber.Ctx) error {
		return c.Type("json").SendString(docs.SwaggerInfo.ReadDoc())
	})
	app.Get("/swagger*", func(c fiber.Ctx) error {
		return c.Type("html").SendString(swaggerUIHTML)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Println("listening on :" + port + " — swagger at http://localhost:" + port + "/swagger")
	log.Fatal(app.Listen(":" + port))
}

const swaggerUIHTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Simple Auth API — Swagger</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"/>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: "/swagger/doc.json", dom_id: "#swagger-ui" });
  </script>
</body>
</html>`
