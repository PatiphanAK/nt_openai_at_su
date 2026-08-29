package user

import "time"

type User struct {
	ID        string    `gorm:"primaryKey;size:36" json:"id"`
	Email     string    `gorm:"uniqueIndex;size:255" json:"email"`
	Name      string    `gorm:"size:255" json:"name"`
	Password  string    `gorm:"size:255" json:"-"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
