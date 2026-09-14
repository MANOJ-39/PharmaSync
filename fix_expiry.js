const fs = require('fs');
let file = 'backend/src/main/java/com/smartinventory/app/service/ExpiryAndReorderService.java';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('@Scheduled(fixedRate = 300000)', '@Scheduled(fixedRate = 5000)');

let searchStr = 'notificationProducer.sendNotificationEvent("STOCK_RESTOCKED", "Product " + req.getProduct().getName() + " is back in stock. Current stock: " + currentStock, "INFO");';

let replaceStr = `notificationProducer.sendNotificationEvent("STOCK_RESTOCKED", "Product " + req.getProduct().getName() + " is back in stock. Current stock: " + currentStock, "INFO");
                List<Notification> notifs = notificationRepository.findAll();
                for(Notification n : notifs) {
                    if (n.getMessage().contains(req.getProduct().getName()) && n.getType().equals("LOW_STOCK")) {
                        notificationRepository.delete(n);
                    }
                }`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed ExpiryAndReorderService');
