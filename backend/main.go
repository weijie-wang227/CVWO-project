package main

import (
	"database/sql"
	"forum-app/database"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

// Post structure
type Thread struct {
	ID         int    `json:"id"`
	Title      string `json:"title"`
	Content    string `json:"content"`
	UserID     int    `json:"userId"`
	Categories []int  `json:"categories"`
}

// Comment structure
type Comment struct {
	ID      int    `json:"id"`
	Content string `json:"content"`
	UserID  int    `json:"userId"`
	PostID  int    `json:"postId"`
}

func main() {
	database.ConnectDatabase()
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// User Login Route
	r.POST("/login", func(c *gin.Context) {
		var user struct {
			Username string `json:"username"`
		}
		if err := c.BindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		// Check if user exists
		var id int
		err := database.DB.QueryRow("SELECT id FROM users WHERE username = ?", user.Username).Scan(&id)
		if err == sql.ErrNoRows {
			// Create user if not exists
			res, err := database.DB.Exec("INSERT INTO users (username) VALUES (?)", user.Username)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
				return
			}
			id64, _ := res.LastInsertId()
			id = int(id64)
		}

		c.JSON(http.StatusOK, gin.H{"userId": id})
	})

	// Get All Threads
	r.GET("/threads", func(c *gin.Context) {
		rows, err := database.DB.Query(`
			SELECT t.id, t.title, t.content, t.user_id, GROUP_CONCAT(tc.category_id) AS categories
			FROM threads t
			LEFT JOIN thread_categories tc ON t.id = tc.thread_id
			GROUP BY t.id
		`)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch threads"})
			return
		}
		defer rows.Close()

		var threads []map[string]interface{}
		for rows.Next() {
			var id, userId int
			var title, content, categories string
			rows.Scan(&id, &title, &content, &userId, &categories)
			categoryIDs := []int{}
			if categories != "" {
				for _, cat := range strings.Split(categories, ",") {
					catID, _ := strconv.Atoi(cat)
					categoryIDs = append(categoryIDs, catID)
				}
			}
			threads = append(threads, gin.H{
				"id":         id,
				"title":      title,
				"content":    content,
				"userId":     userId,
				"categories": categoryIDs,
			})
		}
		c.JSON(http.StatusOK, threads)
	})

	// Create a Thread
	r.POST("/threads", func(c *gin.Context) {
		var thread Thread
		if err := c.BindJSON(&thread); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		result, err := database.DB.Exec("INSERT INTO threads (title, content, user_id) VALUES (?, ?, ?)", thread.Title, thread.Content, thread.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create thread"})
			return
		}

		threadID, _ := result.LastInsertId()

		// Insert categories
		for _, categoryID := range thread.Categories {
			_, err := database.DB.Exec("INSERT INTO thread_categories (thread_id, category_id) VALUES (?, ?)", threadID, categoryID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add categories"})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "Thread created successfully", "id": threadID})
	})

	// Edit a Thread
	r.PUT("/threads/:id", func(c *gin.Context) {
		id := c.Param("id")
		var thread struct {
			Title   string `json:"newTitle"`
			Content string `json:"newContent"`
			UserID  int    `json:"userId"`
		}
		if err := c.BindJSON(&thread); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		// Check if user owns the thread
		var dbUserID int
		err := database.DB.QueryRow("SELECT user_id FROM threads WHERE id = ?", id).Scan(&dbUserID)
		if err != nil || dbUserID != thread.UserID {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		_, err = database.DB.Exec("UPDATE threads SET title = ?, content = ? WHERE id = ?", thread.Title, thread.Content, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update thread"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Thread updated successfully"})
	})

	r.DELETE("threads/:id", func(c *gin.Context) {
		threadID := c.Param("id")
		_, err := database.DB.Exec("DELETE FROM threads WHERE id = ?", threadID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete thread"})
		}

		_, err2 := database.DB.Exec("DELETE FROM comments WHERE id = ?", threadID)
		if err2 != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comments"})
		}
	})

	//Get All Comments
	r.GET("/threads/:id/comments", func(c *gin.Context) {
		id := c.Param("id")
		rows, err := database.DB.Query("SELECT id, content, user_id FROM comments WHERE thread_id = ?", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
			return
		}
		defer rows.Close()

		var comments []map[string]interface{}
		for rows.Next() {
			var id, user_id int
			var content string
			rows.Scan(&id, &content, &user_id)
			comments = append(comments, gin.H{"id": id, "content": content, "userId": user_id})
		}
		c.JSON(http.StatusOK, comments)
	})

	//Post Comment
	r.POST("/threads/:id/comments", func(c *gin.Context) {
		threadID := c.Param("id")
		var comment Comment
		if err := c.ShouldBindJSON(&comment); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}
		_, err := database.DB.Exec("INSERT INTO comments (content, user_id, thread_id) VALUES (?, ?, ?)",
			comment.Content, comment.UserID, threadID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add comment"})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Comment added"})
	})

	//Delete comment
	r.DELETE("comments/:id", func(c *gin.Context) {
		commentID := c.Param("id")
		_, err := database.DB.Exec("DELETE FROM comments WHERE id = ?", commentID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment"})
		}
	})

	r.GET("/categories", func(c *gin.Context) {
		rows, err := database.DB.Query("SELECT id, name FROM categories")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		}

		var categories []map[string]interface{}
		for rows.Next() {
			var id int
			var name string
			rows.Scan(&id, &name)
			categories = append(categories, gin.H{"id": id, "name": name})
		}
		c.JSON(http.StatusOK, categories)
	})

	r.Run(":8080")
}
