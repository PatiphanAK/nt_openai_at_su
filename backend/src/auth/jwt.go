package auth

import (
	"errors"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

const claimsKey = "user_id"

func secret() []byte {
	return []byte(os.Getenv("JWT_SECRET"))
}

func GenerateToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(72 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret())
}

func AuthMiddleware(c fiber.Ctx) error {
	header := c.Get("Authorization")
	tokenStr, ok := strings.CutPrefix(header, "Bearer ")
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing bearer token"})
	}

	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return secret(), nil
	})
	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token"})
	}
	userID, _ := claims["sub"].(string)
	c.Locals(claimsKey, userID)

	return c.Next()
}

func currentUserID(c fiber.Ctx) string {
	id, _ := c.Locals(claimsKey).(string)
	return id
}
