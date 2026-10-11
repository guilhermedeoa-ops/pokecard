import { Body, Controller, Get, HttpCode, Post, Req, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { JourneyService } from "./journey.service";
import { EventDto, PackDto } from "./dto";
@Throttle({ default: { ttl: 60000, limit: 120 } })
@Controller("journey")
export class JourneyController {
  constructor(private readonly journey: JourneyService) {}
  private id(request: Request) { return this.journey.trainerId(request.cookies?.pokecard_session); }
  @Get() async state(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    response.setHeader("Cache-Control", "no-store"); return this.journey.state(await this.id(request));
  }
  @Post("oak/advance") @HttpCode(200) async oak(@Req() r: Request) { return this.journey.advanceOak(await this.id(r)); }
  @Post("starter") @HttpCode(200) async starter(@Req() r: Request, @Body() dto: PackDto) { return this.journey.choose(await this.id(r), dto.packId); }
  @Post("event") @HttpCode(200) async event(@Req() r: Request, @Body() dto: EventDto) { return this.journey.event(await this.id(r), dto.event); }
  @Post("kit") @HttpCode(200) async kit(@Req() r: Request) { return this.journey.kit(await this.id(r)); }
  @Post("complete") @HttpCode(200) async complete(@Req() r: Request) { return this.journey.complete(await this.id(r)); }
  @Get("cards") async cards(@Req() r: Request) { return this.journey.cards(await this.id(r)); }
  @Get("dex") async dex(@Req() r: Request) { return this.journey.dex(await this.id(r)); }
  @Get("inventory") async inventory(@Req() r: Request) { return this.journey.inventory(await this.id(r)); }
}
