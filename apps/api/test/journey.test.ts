import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { createApp } from "../src/create-app";
import { PrismaService } from "../src/database/prisma.service";
import { MailService } from "../src/auth/mail.service";
import { starterStats } from "../src/journey/content";

test("three deterministic starters, atomic rewards, resumable tutorial and authorization", async () => {
  assert.ok(process.env.DATABASE_URL?.includes("/pokecard_test"));
  const app = await createApp(); await app.listen(0, "127.0.0.1");
  app.get(MailService).onModuleDestroy();
  const db = app.get(PrismaService), url = await app.getUrl();
  const users: string[] = [], trainers: string[] = [];
  const request = (cookie: string, path: string, body?: unknown) => fetch(url + "/api/journey" + path, {
    method: body === undefined ? "GET" : "POST",
    headers: { Cookie: cookie, Origin: "http://localhost:3000", "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  try {
    assert.equal(await db.pokemonSpecies.count(), 151);
    assert.equal((await request("", "")).status, 401);
    for (const [packId, speciesId] of [["fire",4],["water",7],["grass",1]] as const) {
      const key = "j_" + randomUUID().slice(0,8), token = createHash("sha256").update(randomUUID()).digest("hex");
      const user = await db.user.create({ data: {
        username: key, usernameKey: key, email: key+"@example.test", emailKey: key+"@example.test",
        passwordHash: "not-used-by-this-fixture", emailVerifiedAt: new Date(), trainer: { create: { displayName: key } },
        sessions: { create: { tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now()+60000) } },
      }, include: { trainer: true } });
      users.push(user.id); trainers.push(user.trainer!.id);
      const cookie = "pokecard_session="+token, id = user.trainer!.id;
      assert.equal((await request(cookie, "")).status, 200);
      assert.equal((await request(cookie, "").then(r=>r.json())).phase, "OAK");
      assert.equal((await request(cookie,"/starter",{packId})).status,400);
      assert.equal((await request(cookie,"/complete",{})).status,400);
      await request(cookie,"/oak/advance",{});
      const resumed = await request(cookie,"").then(r=>r.json());
      assert.equal(resumed.trainer.tutorial.dialogIndex,1);
      await request(cookie,"/oak/advance",{}); await request(cookie,"/oak/advance",{});
      assert.equal((await request(cookie,"/starter",{packId, speciesId:151})).status,400);
      assert.equal((await request(cookie,"/starter",{packId:"random"})).status,400);
      const choices = await Promise.all(Array.from({length:4},()=>request(cookie,"/starter",{packId})));
      assert.ok(choices.every(r=>r.status===200));
      assert.equal(await db.pokemonInstance.count({where:{ownerId:id}}),1);
      const card = await db.pokemonInstance.findFirstOrThrow({where:{ownerId:id},include:{species:true}});
      assert.equal(card.speciesId,speciesId); assert.equal(card.level,5); assert.equal(card.originBall,"POKE_BALL");
      assert.equal(card.originalTrainerName,key);
      assert.equal((await request(cookie,"").then(r=>r.json())).phase,"REVEAL");
      const different = packId==="fire"?"water":"fire";
      assert.equal((await request(cookie,"/starter",{packId:different})).status,409);
      assert.equal((await request(cookie,"/kit",{})).status,400);
      await request(cookie,"/event",{event:"REVEALED"}); await request(cookie,"/event",{event:"DETAILS"});
      const kits=await Promise.all(Array.from({length:4},()=>request(cookie,"/kit",{})));
      assert.ok(kits.every(r=>r.status===200));
      assert.equal((await db.trainer.findUniqueOrThrow({where:{id}})).pokedollars,500);
      assert.equal(await db.rewardGrant.count({where:{trainerId:id,key:"STARTER_KIT"}}),1);
      const inventory = await db.inventoryEntry.findMany({where:{trainerId:id}});
      assert.deepEqual(Object.fromEntries(inventory.map(i=>[i.itemId,i.quantity])),{"poke-ball":5,potion:3,revive:1});
      assert.equal((await request(cookie,"/complete",{})).status,400);
      const dex=await request(cookie,"/dex").then(r=>r.json());
      assert.equal(dex.length,151); assert.equal(dex.filter((s:any)=>s.status==="CAPTURED").length,1);
      assert.equal(dex.find((s:any)=>s.id===speciesId).status,"CAPTURED");
      for(const event of ["COLLECTION","POKEDEX","MAP"])await request(cookie,"/event",{event});
      const completions=await Promise.all([request(cookie,"/complete",{}),request(cookie,"/complete",{})]);
      assert.ok(completions.every(r=>r.status===200));
      assert.equal((await request(cookie,"").then(r=>r.json())).phase,"COMPLETE");
      assert.equal(await db.playerLocationUnlock.count({where:{trainerId:id,locationId:"route-1"}}),1);
      assert.equal((await db.trainer.findUniqueOrThrow({where:{id}})).pokedollars,500);
      assert.equal(await db.pokemonInstance.count({where:{ownerId:id}}),1);
      assert.deepEqual(card.stats,starterStats(card.species.baseStats as any));
      assert.equal((await request(cookie,"/event",{event:"MAP",trainerId:randomUUID()})).status,400);
      const cards=await request(cookie,"/cards").then(r=>r.json());
      assert.ok(cards.every((c:any)=>c.ownerId===id));
      // Dex history survives a future ownership transfer.
      if(trainers.length>1){
        await db.pokemonInstance.update({where:{id:card.id},data:{ownerId:trainers[0]}});
        assert.equal(await db.pokedexEntry.count({where:{trainerId:id,speciesId,status:"CAPTURED"}}),1);
      }
    }
    assert.equal(await db.pokemonInstance.count({where:{originalTrainerId:{in:trainers}}}),3);
  } finally {
    await db.starterSelection.deleteMany({where:{trainerId:{in:trainers}}});
    await db.pokemonInstance.deleteMany({where:{originalTrainerId:{in:trainers}}});
    await db.user.deleteMany({where:{id:{in:users}}}); await app.close();
  }
});
