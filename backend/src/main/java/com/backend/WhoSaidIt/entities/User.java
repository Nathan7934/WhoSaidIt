package com.backend.WhoSaidIt.entities;

import com.backend.WhoSaidIt.DTOs.UserDTO;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.GenerationType.SEQUENCE;

@Entity
@Table(
		name = "users",
		uniqueConstraints = {
			@UniqueConstraint(name = "username_unique", columnNames = "username"),
			@UniqueConstraint(name = "password_unique", columnNames = "password")
		}
)
public class User {

	@Id
	@SequenceGenerator(name = "user_sequence", sequenceName = "user_sequence", allocationSize = 1)
	@GeneratedValue(strategy = SEQUENCE, generator = "user_sequence")
	@Column(name = "userId", updatable = false)
	private Long id;

	@Column(name = "username", columnDefinition = "TEXT", nullable = false)
	private String username;

	@Column(name = "password", columnDefinition = "TEXT", nullable = false)
	private String password;

	@OneToMany(mappedBy = "user")
	@JsonBackReference
	private List<GroupChat> groupChats = new ArrayList<GroupChat>();

	public User() {}

	public User(Long id, String username, String password) {
		this.id = id;
		this.username = username;
		this.password = password;
	}

	public Long getId() { return id; }

	public String getUsername() { return username; }

	public void setUsername(String username) { this.username = username; }

	public String getPassword() { return password; }

	public void setPassword(String password) { this.password = password; }

	public UserDTO toDTO() {
		return new UserDTO(
				this.getId(),
				this.getUsername()
		);
	}
}
