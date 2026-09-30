package com.prizmabrixx.crm.repository;

import com.prizmabrixx.crm.domain.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClientId(Long clientId);
    List<Project> findByManagerId(Long managerId);
    List<Project> findByAssignedEmployeeId(Long assignedEmployeeId);
}
