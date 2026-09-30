package com.prizmabrixx.crm.repository;

import com.prizmabrixx.crm.domain.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByStatus(String status);
    List<Lead> findByOwnerId(Long ownerId);
    boolean existsByClientCompanyAndEmail(String clientCompany, String email);
}
