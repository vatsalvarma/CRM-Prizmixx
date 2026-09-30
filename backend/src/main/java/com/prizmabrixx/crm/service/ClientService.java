package com.prizmabrixx.crm.service;

import com.prizmabrixx.crm.domain.entity.Client;
import com.prizmabrixx.crm.domain.entity.ClientContact;
import com.prizmabrixx.crm.dto.ClientContactDTO;
import com.prizmabrixx.crm.dto.ClientDTO;
import com.prizmabrixx.crm.repository.ClientContactRepository;
import com.prizmabrixx.crm.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final ClientContactRepository clientContactRepository;

    public List<ClientDTO> getAllClients() {
        return clientRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ClientDTO mapToDTO(Client client) {
        List<ClientContact> contacts = clientContactRepository.findByClientId(client.getId());
        
        List<ClientContactDTO> contactDTOs = contacts.stream()
                .map(c -> ClientContactDTO.builder()
                        .id(c.getId())
                        .clientId(client.getId())
                        .firstName(c.getFirstName())
                        .lastName(c.getLastName())
                        .email(c.getEmail())
                        .phone(c.getPhone())
                        .isPrimary(c.getIsPrimary())
                        .build())
                .collect(Collectors.toList());

        return ClientDTO.builder()
                .id(client.getId())
                .companyName(client.getCompanyName())
                .industry(client.getIndustry())
                .website(client.getWebsite())
                .status(client.getStatus())
                .ownerId(client.getOwner() != null ? client.getOwner().getId() : null)
                .ownerName(client.getOwner() != null ? 
                        client.getOwner().getUser().getFirstName() + " " + client.getOwner().getUser().getLastName() : null)
                .contacts(contactDTOs)
                .build();
    }
}
