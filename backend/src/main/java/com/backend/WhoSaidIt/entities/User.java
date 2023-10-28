package com.backend.WhoSaidIt.entities;

import com.backend.WhoSaidIt.DTOs.UserDTO;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
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
public class User implements UserDetails {

	@Id
	@SequenceGenerator(name = "user_sequence", sequenceName = "user_sequence", allocationSize = 1)
	@GeneratedValue(strategy = SEQUENCE, generator = "user_sequence")
	@Column(name = "userId", updatable = false)
	private Long id;

	@Column(name = "email", columnDefinition = "TEXT", nullable = false)
	private String email;

	@Column(name = "username", columnDefinition = "TEXT", nullable = false)
	private String username;

	@Column(name = "password", columnDefinition = "TEXT", nullable = false)
	private String password;

	@OneToMany(mappedBy = "user")
	@JsonBackReference
	private List<GroupChat> groupChats = new ArrayList<GroupChat>();

	@Enumerated(EnumType.STRING)
	private Role role;

	public User() {}

	public User(String username, String password, String email, Role role) {
		this.username = username;
		this.password = password;
		this.email = email;
		this.role = role;
	}

	public Long getId() { return id; }

	@Override
	public String getUsername() { return username; }

	@Override
	public String getPassword() { return password; }

	// The below methods are required implementations for the UserDetails interface
	// ============================================================================
	@Override
	public boolean isAccountNonExpired() { return true; }

	@Override
	public boolean isAccountNonLocked() { return true; }

	@Override
	public boolean isCredentialsNonExpired() { return true; }

	@Override
	public boolean isEnabled() { return true; }

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority(role.name()));
	}
	// ============================================================================

	public UserDTO toDTO() {
		return new UserDTO(
				this.id,
				this.username,
				this.email
		);
	}
}
