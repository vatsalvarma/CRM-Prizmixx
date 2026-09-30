package com.prizmabrixx.crm.repository;

import com.prizmabrixx.crm.domain.entity.HRLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HRLeadRepository extends JpaRepository<HRLead, Long> {
    List<HRLead> findByStatus(String status);
}
