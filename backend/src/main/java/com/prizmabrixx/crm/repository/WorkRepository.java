package com.prizmabrixx.crm.repository;

import com.prizmabrixx.crm.domain.entity.Work;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkRepository extends JpaRepository<Work, Long> {
    List<Work> findByAssignedEmployeeId(Long employeeId);
    List<Work> findByDepartmentId(Long departmentId);
}
