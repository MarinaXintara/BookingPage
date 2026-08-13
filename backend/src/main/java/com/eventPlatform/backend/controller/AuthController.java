package com.eventPlatform.backend.controller;

import com.eventPlatform.backend.DTO.LoginRequest;
import com.eventPlatform.backend.DTO.UserResponse;
import com.eventPlatform.backend.entity.User;
import com.eventPlatform.backend.jwt.JwtService;
import com.eventPlatform.backend.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.ArrayList;
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
    public String loginUser(@RequestBody LoginRequest request, HttpServletResponse response) {
        User existingUser = userService.findByEmail(request.getEmail());

        if(existingUser == null || !passwordEncoder.matches(request.getPassword(), existingUser.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(existingUser);

        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Duration.ofHours(24))
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return "Logged in";
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
    public String logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return "Logged out";
    }

    @GetMapping("/showUsers")
    public List<UserResponse> showUsers(Authentication authentication) {

        if(authentication == null || !authentication.isAuthenticated()){
            throw new RuntimeException("Not logged in");
        }

        Long userId = Long.parseLong(authentication.getName());

        User user = userService.findById(userId);

        if(user == null){
            throw new RuntimeException("User not found");
        }

        if(!"ADMIN".equals(user.getRole())){
            throw new RuntimeException("Not Admin");
        }

        List<User> allUsers = userService.getAllUsers();
        List<UserResponse> userResponses = new ArrayList<>();

        for(User u : allUsers) {
            userResponses.add(new UserResponse(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail(), u.getRole()));
        }
        return userResponses;
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        User user = userService.findById(id);
        if(user == null){
            throw new RuntimeException("User not found");
        }

        return new UserResponse(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getRole());
    }

    @PostMapping("/changeRole/{id}")
    public String changeRole(@PathVariable Long id, @RequestBody String role, Authentication authentication) {
        if(authentication == null || !authentication.isAuthenticated()){
            throw new RuntimeException("Not logged in");
        }

        Long userId = Long.parseLong(authentication.getName());
        User currUser = userService.findById(userId);
        if(currUser == null){
            throw new RuntimeException("User not found");
        }
        if(!"ADMIN".equals(currUser.getRole())){
            throw new RuntimeException("Not Admin");
        }

        User user = userService.findById(id);
        if(user == null){
            throw new RuntimeException("User not found");
        }
        if(role.equals("ADMIN") || role.equals("ORGANISER")){
            user.setRole(role);
            userService.saveUser(user);
        }else{
            throw new RuntimeException("Wrong role given");
        }

        return "User Role Changed";
    }

    @PostMapping("/changeRole/{id}")
    public String changeRole(@PathVariable Long id, Authentication authentication) {
        if(authentication == null || !authentication.isAuthenticated()){
            throw new RuntimeException("Not logged in");
        }

        Long userId = Long.parseLong(authentication.getName());
        User currUser = userService.findById(userId);
        if(currUser == null){
            throw new RuntimeException("User not found");
        }
        if(!"ADMIN".equals(currUser.getRole())){
            throw new RuntimeException("Not Admin");
        }

        User user = userService.findById(id);
        if(user == null){
            throw new RuntimeException("User not found");
        }
        if(user.getStatus().equals("PENDING")){
            user.setStatus("APPROVED");
        }
        return "User Approved";
    }
}