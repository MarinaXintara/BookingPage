package com.eventPlatform.backend.controller;


import com.eventPlatform.backend.Util.HashUtil;
import com.eventPlatform.backend.entity.User;
import com.eventPlatform.backend.service.UserService;
import org.apache.tomcat.util.http.parser.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("login")
    public String loginUser(@RequestBody User user) {
        User temp =  userService.findById(user.getId());
        if(temp == null) {
            throw new RuntimeException("failed");
        }
        if(temp.getEmail().equals(user.getEmail())) {
            if (HashUtil.sha256(temp.getPassword()).equals(user.getPassword())) {
                return "success";
            }
        }
        throw new RuntimeException("failed");
    }

    @PostMapping("register")
    public String registerUser(@RequestBody User user) {
        try{
            userService.saveUser(user);
            return "success";
        }
        catch(Exception e){
            throw new RuntimeException(e);
        }
    }
}
