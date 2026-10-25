up:
	docker compose -f infra/docker-compose.yml up -d
down:
	docker compose -f infra/docker-compose.yml down
reset:
	docker compose -f infra/docker-compose.yml down -v   # -v wipes DB data
ps:
	docker compose -f infra/docker-compose.yml ps
logs:
	docker compose -f infra/docker-compose.yml logs -f
