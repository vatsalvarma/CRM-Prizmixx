package com.prizmabrixx.crm.repository;

import com.prizmabrixx.crm.domain.entity.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findByEmployeeId(Long employeeId);
    Optional<PushSubscription> findByEndpoint(String endpoint);
    List<PushSubscription> findByEmployee_User_Role_NameIn(List<String> roleNames);
}
