package com.eventPlatform.backend.controller;

import com.eventPlatform.backend.DTO.LoginRequest;
import com.eventPlatform.backend.DTO.LoginResponse;
import com.eventPlatform.backend.DTO.UserResponse;
import com.eventPlatform.backend.entity.User;
import com.eventPlatform.backend.jwt.JwtService;
import com.eventPlatform.backend.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder ,JwtService jwtService){
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    @PostMapping("/login")
    public LoginResponse loginUser(@RequestBody LoginRequest request) {
        User existingUser = userService.findByEmail(request.getEmail());

        if(existingUser == null) {
            throw new RuntimeException("Invalid credentials");
        }

        if(!passwordEncoder.matches(request.getPassword(), existingUser.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(existingUser);
        return new LoginResponse(token);
    }


    @PostMapping("/register")
    public String registerUser(@RequestBody User user) {

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userService.saveUser(user);

        return "success";
    }


    @GetMapping("/me")
    public UserResponse me(Authentication authentication){

        Long userId = Long.parseLong(authentication.getName());

        User user = userService.findById(userId);

        if(user == null){
            throw new RuntimeException("User not found");
        }
        return new UserResponse(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getRole());
    }

    @PostMapping("/logout")
    public String logout() {
        return "Logged out successfully";
    }

    @GetMapping("/showUsers")
    public List<User> ShowUsers(Authentication authentication) { //Fix this to use UserResponse so it doesn't send to front password
        if(authentication == null || !authentication.isAuthenticated()){
            throw new RuntimeException("Not logged in");
        }

        Long userId = Long.parseLong(authentication.getName());

        User user = userService.findById(userId);
        if(user == null){
            throw new RuntimeException("User not found");
        }

        String userRole = user.getRole();
        if(!"ADMIN".equals(userRole) ){
            throw new RuntimeException("Not Admin");
        }
        List<User> allUsers = userService.getAllUsers();
        return allUsers;

    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        User user = userService.findById(id);

        if(user == null) {
            throw new RuntimeException("User not found");
        }

        return user;
    }

}