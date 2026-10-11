import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import type { TestInfo } from "@playwright/test";

async function visualReport(info: TestInfo) {
  const names=["01-oak","02-packs","03-reveal","04-details","05-kit","06-collection","07-pokedex","08-mission","09-map"];
  const tiles=[];
  for(let i=0;i<names.length;i++){
    const input=await sharp(await readFile(info.outputPath(names[i]+".png"))).resize(480,320,{fit:"contain",background:"#07101a"}).png().toBuffer();
    tiles.push({input,left:(i%3)*480,top:Math.floor(i/3)*340});
  }
  const image=await sharp({create:{width:1440,height:1020,channels:3,background:"#07101a"}}).composite(tiles).webp({quality:78}).toBuffer();
  await writeFile(info.outputPath("contact-sheet.webp"),image);
  console.log("VISUAL_QA_"+info.project.name+":"+image.toString("base64"));
}


const db = new PrismaClient();
const password = "Chapter one strong password!";
let userId: string, trainerId: string, username: string;
test.beforeEach(async ({ page }) => {
  if (!process.env.DATABASE_URL?.includes("/pokecard_test")) throw new Error("Disposable test database required");
  username = "e2e_" + randomUUID().slice(0,8);
  const user = await db.user.create({ data: {
    username, usernameKey: username, email: username+"@example.test", emailKey: username+"@example.test",
    passwordHash: await argon2.hash(password), emailVerifiedAt: new Date(), trainer: { create: { displayName: "Treinador de teste" } },
  }, include: { trainer: true } });
  userId = user.id; trainerId = user.trainer!.id;
  await page.addInitScript(() => {
    (window as any).__audioStarts = 0;
    const native = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...args: Parameters<typeof native>) {
      (window as any).__audioStarts++; return native.apply(this,args);
    };
  });
  await page.goto("/login");
  await page.getByLabel("Usuário ou e-mail").fill(username);
  await page.getByLabel("Senha", {exact:true}).fill(password);
  await page.getByRole("button", {name:"Entrar",exact:true}).click();
  await expect(page).toHaveURL(/\/pallet$/);
  await expect(page.getByRole("region",{name:"Diálogo do Professor Oak"})).toBeVisible();
});
test.afterEach(async () => {
  await db.starterSelection.deleteMany({where:{trainerId}});
  await db.pokemonInstance.deleteMany({where:{originalTrainerId:trainerId}});
  await db.user.deleteMany({where:{id:userId}});
});
test.afterAll(async()=>db.$disconnect());
async function oak(page: any) {
  for(let i=0;i<3;i++)await page.getByRole("button",{name:/^Continuar/}).click();
  await expect(page.getByRole("heading",{name:"Escolha o seu Pacote Inicial"})).toBeVisible();
}

test("chapter lifecycle, pack change, refresh, red card, rewards and route unlock", async ({page}, info) => {
  await expect(page.getByRole("button",{name:"Áudio desligado"})).toHaveAttribute("aria-pressed","false");
  await page.screenshot({path:info.outputPath("01-oak.png"),fullPage:true});
  await oak(page);
  await page.getByRole("button",{name:"Escolher Pack Fogo"}).click();
  await page.getByRole("button",{name:"Escolher Pack Água"}).click();
  await page.getByRole("button",{name:"Confirmar Pack Água"}).click();
  await expect(page.getByRole("dialog",{name:"Confirmar Pokémon inicial"})).toContainText("Squirtle");
  await page.getByRole("button",{name:"Voltar",exact:true}).click();
  await page.getByRole("button",{name:"Escolher Pack Fogo"}).click();
  await page.screenshot({path:info.outputPath("02-packs.png"),fullPage:true});
  await page.getByRole("button",{name:"Confirmar Pack Fogo"}).click();
  await page.getByRole("button",{name:"Receber Charmander"}).click();
  await expect(page.getByRole("heading",{name:"Abrindo seu pacote…"})).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading",{name:"Abrindo seu pacote…"})).toBeVisible();
  await expect.poll(()=>db.pokemonInstance.count({where:{ownerId:trainerId}})).toBe(1);
  await page.getByRole("button",{name:"Pular animação"}).click();
  await expect(page.getByRole("heading",{name:"Você recebeu um Charmander!"})).toBeVisible();
  await page.screenshot({path:info.outputPath("03-reveal.png"),fullPage:true});
  await page.getByRole("button",{name:"Adicionar à minha coleção"}).click();
  await expect(page.getByRole("heading",{name:"Conheça seu Charmander"})).toBeVisible();
  await expect(page.locator(".first-card .pokemon-card")).toContainText("Nv. 5");
  await expect(page.locator(".first-card .pokemon-card")).toHaveCSS("border-top-color","rgb(255, 73, 57)");
  await page.locator(".first-card summary").click();
  await expect(page.locator(".first-card")).toContainText("Pokémon Inicial — Presente do Professor Oak");
  await page.screenshot({path:info.outputPath("04-details.png"),fullPage:true});
  await page.getByRole("button",{name:"Confirmar e iniciar minha jornada"}).click();
  await page.getByRole("button",{name:/Receber kit inicial/}).click();
  await expect(page.getByRole("dialog",{name:"Kit inicial recebido"})).toContainText("500 Pokédollars");
  await page.screenshot({path:info.outputPath("05-kit.png"),fullPage:true});
  await page.getByRole("dialog").getByRole("button",{name:"Continuar",exact:true}).click();
  await expect(page.getByRole("button",{name:"Concluir tutorial e desbloquear Rota 1"})).toBeDisabled();
  await page.getByRole("button",{name:"Minhas Cartas",exact:true}).click();
  await expect(page.getByRole("button",{name:"Ver atributos de Charmander"})).toBeVisible();
  await page.screenshot({path:info.outputPath("06-collection.png"),fullPage:true});
  await page.getByRole("button",{name:"Pokédex",exact:true}).click();
  await expect(page.locator(".dex-counts")).toContainText("Total: 151");
  await page.getByLabel("Filtrar").selectOption("captured");
  await expect(page.locator(".dex-entry")).toHaveCount(1);
  await expect(page.locator(".dex-entry")).toContainText("Charmander");
  await page.screenshot({path:info.outputPath("07-pokedex.png"),fullPage:true});
  await page.getByRole("button",{name:"Mapa de Kanto",exact:true}).click();
  await expect(page.locator(".location-grid")).toContainText("Conclua o tutorial");
  await page.getByRole("button",{name:"Missões",exact:true}).click();
  await expect(page.getByRole("button",{name:"Concluir tutorial e desbloquear Rota 1"})).toBeEnabled();
  await page.screenshot({path:info.outputPath("08-mission.png"),fullPage:true});
  await page.getByRole("button",{name:"Concluir tutorial e desbloquear Rota 1"}).click();
  await expect(page.getByRole("heading",{name:"A jornada está só começando"})).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading",{name:"A jornada está só começando"})).toBeVisible();
  await page.getByRole("button",{name:"Mapa de Kanto",exact:true}).click();
  await expect(page.locator(".location-grid")).toContainText("Desbloqueada");
  await page.screenshot({path:info.outputPath("09-map.png"),fullPage:true});
  const trainer = await db.trainer.findUniqueOrThrow({where:{id:trainerId}});
  expect(trainer.pokedollars).toBe(500);
  expect(await db.rewardGrant.count({where:{trainerId}})).toBe(1);
  expect(await db.pokemonInstance.count({where:{ownerId:trainerId}})).toBe(1);
  expect(await page.evaluate(()=>(window as any).__audioStarts)).toBe(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await visualReport(info);
});
test("reduced motion and keyboard confirmation remain functional", async ({page}, info) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await oak(page);
  await page.getByRole("button",{name:"Escolher Pack Planta"}).click();
  await page.getByRole("button",{name:"Confirmar Pack Planta"}).click();
  const receive=page.getByRole("button",{name:"Receber Bulbasaur"});
  await expect(receive).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button",{name:"Confirmar Pack Planta"}).click();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading",{name:"Você recebeu um Bulbasaur!"})).toBeVisible();
  await expect(page.getByRole("button",{name:"Pular animação"})).toHaveCount(0);
  await page.screenshot({path:info.outputPath("reduced-motion.png"),fullPage:true});
  expect(await page.evaluate(()=>(window as any).__audioStarts)).toBe(0);
  await page.getByRole("button",{name:"Adicionar à minha coleção"}).click();
  await expect(page.getByRole("heading",{name:"Conheça seu Bulbasaur"})).toBeVisible();
});
