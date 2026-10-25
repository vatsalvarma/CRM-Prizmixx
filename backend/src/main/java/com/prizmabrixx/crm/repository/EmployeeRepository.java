package com.prizmabrixx.crm.repository;

import com.prizmabrixx.crm.domain.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT MAX(e.employeeId) FROM Employee e WHERE e.employeeId LIKE :prefix%")
    String findMaxEmployeeIdByPrefix(@org.springframework.data.repository.query.Param("prefix") String prefix);

    long countByBranchId(Long branchId);

    List<Employee> findByBranchId(Long branchId);
}
