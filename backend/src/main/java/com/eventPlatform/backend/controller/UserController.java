package com.eventPlatform.backend.controller;

import com.eventPlatform.backend.entity.User;
import com.eventPlatform.backend.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")

public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        User user = userService.findById(id);

        if(user == null) {
            throw new RuntimeException("User not found");
        }

        return user;
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @PutMapping
    public User editUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @PatchMapping
    public User patchUser(@RequestBody User user) {
        User temp =  userService.findById(user.getId());
        if(temp == null) {
            throw new RuntimeException("User not found");
        }
        if(user.getFirstName() != null) {
            temp.setFirstName(user.getFirstName());
        }
        if(user.getLastName() != null) {
            temp.setLastName(user.getLastName());
        }
        if(user.getEmail() != null) {
            temp.setEmail(user.getEmail());
        }
        if(user.getPassword() != null) {
            temp.setPassword(user.getPassword());
        }
        if(user.getFirstName() != null) {
            temp.setPhoneNumber(user.getPhoneNumber());
        }
        if(user.getAddress() != null) {
            temp.setAddress(user.getAddress());
        }
        if(user.getTin() != null) {
            temp.setTin(user.getTin());
        }
        if(user.getRole() != null) {
            temp.setRole(user.getRole());
        }
        return userService.saveUser(temp);

    }
}
