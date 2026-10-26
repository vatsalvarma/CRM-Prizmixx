package com.prizmabrixx.crm.repository;

import com.prizmabrixx.crm.domain.entity.ProjectStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectStageRepository extends JpaRepository<ProjectStage, Long> {
    List<ProjectStage> findByProjectIdOrderByStageOrderAsc(Long projectId);
    Optional<ProjectStage> findByProjectIdAndStageName(Long projectId, String stageName);
    Optional<ProjectStage> findByProjectIdAndStageOrder(Long projectId, Integer stageOrder);
}
