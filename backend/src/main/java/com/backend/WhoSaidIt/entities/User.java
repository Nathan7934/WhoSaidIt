package com.backend.WhoSaidIt.entities;

import com.backend.WhoSaidIt.DTOs.UserDTO;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
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

	@Column(name = "passwordModifiedDate", columnDefinition = "TIMESTAMP", nullable = false)
	private LocalDateTime passwordModifiedDate;

	@OneToMany(mappedBy = "user")
	@JsonBackReference
	private List<GroupChat> groupChats = new ArrayList<GroupChat>();

	@OneToOne
	@JoinColumn(name = "focusedGroupChatId", referencedColumnName = "groupChatId")
	private GroupChat focusedGroupChat; // Defined as foreign key reference to groupChats table

	@Enumerated(EnumType.STRING)
	private Role role;

	public User() {}

	public User(String username, String password, String email, Role role) {
		this.username = username;
		this.password = password;
		this.passwordModifiedDate = LocalDateTime.now();
		this.email = email;
		this.role = role;
	}

	public Long getId() { return id; }

	@Override
	public String getUsername() { return username; }

	@Override
	public String getPassword() { return password; }

	public void setPassword(String password) { this.password = password; }

	public LocalDateTime getPasswordModifiedDate() { return passwordModifiedDate; }

	public void setPasswordModifiedDate(LocalDateTime passwordModifiedDate) {
		this.passwordModifiedDate = passwordModifiedDate;
	}

	public void setEmail(String email) { this.email = email; }

	public List<GroupChat> getGroupChats() { return groupChats; }

	public GroupChat getFocusedGroupChat() { return focusedGroupChat; }

	public void setFocusedGroupChat(GroupChat focusedGroupChat) { this.focusedGroupChat = focusedGroupChat; }

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
				this.email,
				this.focusedGroupChat == null ? -1L : this.focusedGroupChat.getId()
		);
	}
}
