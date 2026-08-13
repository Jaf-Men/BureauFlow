import * as assert from "node:assert/strict";
import { StoreService } from "./store.service";

function run() {
  const store = new StoreService();

  const clientRep = store.createUser({
    name: "Joao da Silva",
    email: "joao@example.com",
    passwordHash: "hash",
    role: "cliente",
    roles: ["cliente"],
    document: "11111111111",
    emailVerified: true,
  });
  store.addRoleToUser(clientRep.id, "despachante");
  assert.equal(store.userHasRole(clientRep.id, "cliente"), true);
  assert.equal(store.userHasRole(clientRep.id, "despachante"), true);

  const lawyer = store.createUser({
    name: "Maria Adv",
    email: "maria@example.com",
    passwordHash: "hash",
    role: "advogado",
    roles: ["advogado"],
    document: "22222222222",
    oab: "12345",
    emailVerified: true,
  });
  assert.equal(store.userHasRole(lawyer.id, "advogado"), true);

  const rep2 = store.createUser({
    name: "Carlos Rep",
    email: "carlos@example.com",
    passwordHash: "hash",
    role: "despachante",
    roles: ["despachante"],
    document: "33333333333",
    emailVerified: true,
  });

  const process = store.createProcess({
    name: "Processo Teste",
    createdByUserId: clientRep.id,
    status: "active",
  });

  store.addProcessParticipant({
    processId: process.id,
    userId: clientRep.id,
    role: "CLIENT",
  });

  const firstRep = store.upsertActiveLegalRepresentative({
    processId: process.id,
    representativeUserId: clientRep.id,
    replacementReason: "Definicao inicial",
  });
  assert.equal(firstRep.next.representationType, "AUTO_REPRESENTANTE_LEGAL");

  const secondRep = store.upsertActiveLegalRepresentative({
    processId: process.id,
    representativeUserId: rep2.id,
    replacementReason: "Substituicao",
  });
  assert.ok(secondRep.previous);
  assert.equal(secondRep.previous?.active, false);
  assert.equal(secondRep.next.active, true);
  assert.equal(store.findActiveLegalRepresentative(process.id)?.userId, rep2.id);

  const legalReps = store.listProcessParticipants(process.id).filter((item) => item.role === "LEGAL_REPRESENTATIVE");
  assert.equal(legalReps.length, 2);
  assert.equal(legalReps.filter((item) => item.active).length, 1);

  console.log("Domain tests passed.");
}

run();
