package com.prizmabrixx.crm.repository;

import com.prizmabrixx.crm.domain.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByIsActiveTrue();
    Optional<Branch> findByCode(String code);
    boolean existsByCode(String code);
    boolean existsByName(String name);
}
