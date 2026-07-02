import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getRoot() {
    return {
      service: "probetes-api",
      message: "Probetes ERP API is running"
    };
  }
}
