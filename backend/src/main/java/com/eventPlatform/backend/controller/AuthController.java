package com.eventPlatform.backend.controller;
import com.eventPlatform.backend.DTO.UserResponse;
import com.eventPlatform.backend.entity.User;
import com.eventPlatform.backend.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder){
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }


    @PostMapping("/login")
    public String loginUser(@RequestBody User user, HttpSession session) {

        User existingUser = userService.findByEmail(user.getEmail());

        if(existingUser == null) {
            throw new RuntimeException("Invalid credentials");
        }

        if(!passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        session.setAttribute("userId", existingUser.getId());

        return "success";
    }


    @PostMapping("/register")
    public String registerUser(@RequestBody User user) {

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userService.saveUser(user);

        return "success";
    }


    @GetMapping("/me")
    public UserResponse me(HttpSession session){

        Long userId = (Long) session.getAttribute("userId");

        if(userId == null){
            throw new RuntimeException("Not logged in");
        }
        User user = userService.findById(userId);

        if(user == null){
            throw new RuntimeException("User not found");
        }
        return new UserResponse(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getRole());
    }

    @PostMapping("/logout")
    public String logout(HttpSession session) {

        session.invalidate();

        return "Logged out successfully";
    }

    @GetMapping("/showUsers")
    public List<User> ShowUsers(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");

        if(userId == null){
            throw new RuntimeException("Not logged in");
        }
        User user = userService.findById(userId);
        if(user == null){
            throw new RuntimeException("User not found");
        }

        String userRole = user.getRole();
        if(!"Admin".equals(userRole) ){
            throw new RuntimeException("Not Admin");
        }
        List<User> allUsers = userService.getAllUsers();
        return allUsers;

    }

}