package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Employee;
import com.prizmabrixx.crm.domain.entity.PushSubscription;
import com.prizmabrixx.crm.domain.entity.User;
import com.prizmabrixx.crm.repository.EmployeeRepository;
import com.prizmabrixx.crm.repository.PushSubscriptionRepository;
import com.prizmabrixx.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.Security;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    // These should ideally be in application.properties, hardcoding for demo setup
    private final String publicKey = "BPoBpPATg43IoQsxy1BMczSlDYZzKSql796nng08Fy_xuelVK4bYllynpyTdoCqCV7jJ7U5d90OOtuDeOr2OTxk";
    private final String privateKey = "1HCjYTdEeC206YV4ZpS_KfsTJbs-LqP_cviRt5gdZ_M";

    private PushService pushService;

    @PostConstruct
    private void init() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        try {
            pushService = new PushService();
            pushService.setPublicKey(publicKey);
            pushService.setPrivateKey(privateKey);
            // pushService.setSubject("mailto:admin@prizmabrixx.com");
        } catch (Exception e) {
            log.error("Failed to initialize PushService", e);
        }
    }

    public void subscribe(String email, Subscription subscriptionData) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Employee employee = employeeRepository.findByUserId(user.getId()).orElseThrow();
        
        // Find existing to update, or create new
        PushSubscription sub = pushSubscriptionRepository.findByEndpoint(subscriptionData.endpoint)
                .orElse(new PushSubscription());
                
        sub.setEmployee(employee);
        sub.setEndpoint(subscriptionData.endpoint);
        sub.setP256dh(subscriptionData.keys.p256dh);
        sub.setAuth(subscriptionData.keys.auth);
        
        pushSubscriptionRepository.save(sub);
        log.info("Saved push subscription for {}", email);
    }

    public void notifyAdmins(String title, String body) {
        List<PushSubscription> adminSubs = pushSubscriptionRepository.findByEmployee_User_Role_NameIn(List.of("ADMIN", "SYSTEM_MASTER"));
        for (PushSubscription sub : adminSubs) {
            sendPushMessage(sub, title, body);
        }
    }

    public void notifyEmployee(Long employeeId, String title, String body) {
        List<PushSubscription> subs = pushSubscriptionRepository.findByEmployeeId(employeeId);
        for (PushSubscription sub : subs) {
            sendPushMessage(sub, title, body);
        }
    }

    private void sendPushMessage(PushSubscription sub, String title, String body) {
        try {
            Subscription.Keys keys = new Subscription.Keys(sub.getP256dh(), sub.getAuth());
            Subscription subscription = new Subscription(sub.getEndpoint(), keys);
            
            String payload = String.format("{\"title\":\"%s\", \"body\":\"%s\"}", title, body);
            Notification notification = new Notification(subscription, payload);
            pushService.send(notification);
        } catch (Exception e) {
            log.error("Failed to send push notification to {}", sub.getEndpoint(), e);
        }
    }
}
