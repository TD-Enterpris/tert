package com.ract.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class WebController {

    private static final Logger logger = LoggerFactory.getLogger(WebController.class);

    // Serve Angular app on root access
    @GetMapping("/")
    public String serveAngularApp() {
        logger.info("Forwarding to Angular app.");
        return "forward:/index.html";  // Serve Angular app
    }

    // Forward any non-API and non-static requests to Angular's index.html
    @GetMapping(value = "/{path:[^\\.]*}")  // Matches any path that does not contain a dot (e.g., .js, .css)
    public String forwardToAngular() {
        logger.info("Forwarding non-API/non-static requests to Angular app.");
        return "forward:/index.html";
    }
}
