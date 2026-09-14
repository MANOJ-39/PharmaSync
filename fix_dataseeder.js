const fs = require('fs');
let file = 'backend/src/main/java/com/smartinventory/app/config/DataSeeder.java';
let content = fs.readFileSync(file, 'utf8');

let replacement = `
        // Force update existing users or create if missing
        userRepository.findByUsername("admin").ifPresent(u -> {
            u.setUsername("Administrator");
            u.setPassword(passwordEncoder.encode("admin123"));
            userRepository.save(u);
        });
        userRepository.findByUsername("cashier").ifPresent(u -> {
            u.setUsername("Sales Associate");
            u.setPassword(passwordEncoder.encode("associate1"));
            userRepository.save(u);
        });
        
        if (userRepository.count() == 0) {
            User admin = User.builder().username("Administrator").password(passwordEncoder.encode("admin123")).role(Role.ADMIN).active(true).build();
            User user = User.builder().username("Sales Associate").password(passwordEncoder.encode("associate1")).role(Role.USER).active(true).build();

            userRepository.save(admin);
            userRepository.save(user);
        } else {
            userRepository.findAll().forEach(u -> {
                u.setActive(true);
                userRepository.save(u);
            });
        }
`;

content = content.replace(/if \(userRepository\.count\(\) == 0\) \{[\s\S]*?\} else \{[\s\S]*?\}/, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed DataSeeder.java');
