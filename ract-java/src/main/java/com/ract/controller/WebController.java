package com.ract.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping(value = "/{path:^(?!.*\\.).*}")  // Matches any path except those containing a dot (like .js, .css, .png, etc.)
    public String redirect() {
        // Forwards all requests to index.html for Angular routing to take over
        return "forward:/index.html";
    }
}
