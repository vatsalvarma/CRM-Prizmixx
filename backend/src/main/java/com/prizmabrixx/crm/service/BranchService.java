package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Branch;
import com.prizmabrixx.crm.domain.entity.Employee;
import com.prizmabrixx.crm.dto.BranchDTO;
import com.prizmabrixx.crm.dto.CreateBranchRequest;
import com.prizmabrixx.crm.repository.BranchRepository;
import com.prizmabrixx.crm.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final EmployeeRepository employeeRepository;

    public List<BranchDTO> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BranchDTO> getActiveBranches() {
        return branchRepository.findByIsActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BranchDTO createBranch(CreateBranchRequest request) {
        if (branchRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new RuntimeException("Branch with code '" + request.getCode() + "' already exists");
        }
        if (branchRepository.existsByName(request.getName())) {
            throw new RuntimeException("Branch with name '" + request.getName() + "' already exists");
        }

        Branch branch = Branch.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .city(request.getCity())
                .isActive(true)
                .build();
        branch = branchRepository.save(branch);
        return mapToDTO(branch);
    }

    @Transactional
    public BranchDTO updateBranch(Long id, CreateBranchRequest request) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        branch.setName(request.getName());
        if (request.getCode() != null && !request.getCode().isBlank()) {
            branch.setCode(request.getCode().toUpperCase());
        }
        if (request.getCity() != null) {
            branch.setCity(request.getCity());
        }
        branch = branchRepository.save(branch);
        return mapToDTO(branch);
    }

    @Transactional
    public void toggleBranchStatus(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        branch.setIsActive(!branch.getIsActive());
        branchRepository.save(branch);
    }

    private BranchDTO mapToDTO(Branch branch) {
        long count = employeeRepository.countByBranchId(branch.getId());
        return BranchDTO.builder()
                .id(branch.getId())
                .name(branch.getName())
                .code(branch.getCode())
                .city(branch.getCity())
                .isActive(branch.getIsActive())
                .employeeCount(count)
                .build();
    }
}
