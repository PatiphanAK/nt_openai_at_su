package auth

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"backend/src/db"
	"backend/src/user"
)

type registerBody struct {
	Email    string `json:"email" example:"hack@test.com"`
	Name     string `json:"name" example:"Hacker"`
	Password string `json:"password" example:"secret123"`
}

type loginBody struct {
	Email    string `json:"email" example:"hack@test.com"`
	Password string `json:"password" example:"secret123"`
}

type authResponse struct {
	User  user.User `json:"user"`
	Token string    `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}

type meResponse struct {
	User user.User `json:"user"`
}

type errorResponse struct {
	Error string `json:"error" example:"invalid credentials"`
}

// Register a new user.
//
//	@Summary      Register
//	@Description  Creates a new account (email + password, min 6 chars) and returns the user with a JWT token.
//	@Tags         auth
//	@Accept       json
//	@Produce      json
//	@Param        request body registerBody true "Registration payload"
//	@Success      201 {object} authResponse
//	@Failure      400 {object} errorResponse
//	@Failure      409 {object} errorResponse "email already registered"
//	@Router       /register [post]
func Register(c fiber.Ctx) error {
	var body registerBody
	if err := c.Bind().Body(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(errorResponse{"invalid body"})
	}
	body.Email = strings.ToLower(strings.TrimSpace(body.Email))
	if body.Email == "" || len(body.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(errorResponse{"email and password (min 6 chars) required"})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(errorResponse{"internal error"})
	}

	u := user.User{
		ID:       uuid.NewString(),
		Email:    body.Email,
		Name:     body.Name,
		Password: string(hash),
	}
	if err := db.DB.Create(&u).Error; err != nil {
		return c.Status(fiber.StatusConflict).JSON(errorResponse{"email already registered"})
	}

	token, err := GenerateToken(u.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(errorResponse{"internal error"})
	}
	return c.Status(fiber.StatusCreated).JSON(authResponse{User: u, Token: token})
}

// Login with email and password.
//
//	@Summary      Login
//	@Description  Verifies credentials and returns the user with a JWT token.
//	@Tags         auth
//	@Accept       json
//	@Produce      json
//	@Param        request body loginBody true "Login payload"
//	@Success      200 {object} authResponse
//	@Failure      400 {object} errorResponse
//	@Failure      401 {object} errorResponse "invalid credentials"
//	@Router       /login [post]
func Login(c fiber.Ctx) error {
	var body loginBody
	if err := c.Bind().Body(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(errorResponse{"invalid body"})
	}
	body.Email = strings.ToLower(strings.TrimSpace(body.Email))

	var u user.User
	if err := db.DB.Where("email = ?", body.Email).First(&u).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(errorResponse{"invalid credentials"})
	}
	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(body.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(errorResponse{"invalid credentials"})
	}

	token, err := GenerateToken(u.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(errorResponse{"internal error"})
	}
	return c.JSON(authResponse{User: u, Token: token})
}

// Get the current authenticated user.
//
//	@Summary      Me
//	@Description  Returns the user that belongs to the bearer token.
//	@Tags         auth
//	@Produce      json
//	@Security     BearerAuth
//	@Success      200 {object} meResponse
//	@Failure      401 {object} errorResponse
//	@Failure      404 {object} errorResponse
//	@Router       /me [get]
func Me(c fiber.Ctx) error {
	var u user.User
	if err := db.DB.First(&u, "id = ?", currentUserID(c)).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(errorResponse{"user not found"})
	}
	return c.JSON(meResponse{User: u})
}
