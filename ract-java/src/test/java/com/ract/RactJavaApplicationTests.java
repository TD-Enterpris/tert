package com.ract;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class RactJavaApplicationTests {

	@Test
	void main() {
		// Create an array of arguments to pass to the main method (can be empty)
		String[] args = {};
		// Call the main method
		com.ract.RactJavaApplication.main(args);
	}
}
