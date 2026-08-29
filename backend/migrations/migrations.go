package migrations

import (
	"gorm.io/gorm"

	"backend/src/user"
)

// Run applies all GORM migrations (AutoMigrate creates/updates the tables).
func Run(db *gorm.DB) error {
	return db.AutoMigrate(
		&user.User{},
	)
}
