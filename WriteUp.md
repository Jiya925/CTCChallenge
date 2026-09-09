# Write-up

## 1. What did you build for Part B, and why that?

I built the GET, POST, and DELETE endpoints for visits because the first thing I noticed when I was looking at the schema was that there was a whole visits table with zero API or UI touching it. The app's entire purpose was to help Brennen track spending from eating out, but when I went to the main page, that wasn't clear at all. I wanted the app to feel more like something that could actually be used, so my second goal for Part B was to work on the UI and give the homepage actual interaction through being able to log visits/spending.

## 2. What did you decide, and what did you rule out?

I decided to add code for creating, listing, and deleting visits, and I ruled out making a PUT endpoint for editing visits. My thought process was that editing wasn't as essential as the other endpoints because if you log a visit wrong, you can simply delete and re-add the visit. I also chose to show all visits together in one long list on the homepage, rather than building separate per-restaurant pages where you'd click into a restaurant to see just its visit history. I decided on it because it was simpler, but I'm not sure if the usefulness of the visits per-restaurant view would have made it worth the time.

## 3. Where did you cut corners?

I cut a lot of corners when it comes to the UI part of the homepage. I didn't have a lot of time to fully flesh out the idea, so I was more focused on just getting something interactive running that I could submit. Some example of this include that the visits list shows the restaurant's raw id instead of its name, the form has no loading state, and the styling is minimal and reused from the existing restaurant list instead of designed by me. With another day, I'd fix the restaurant name lookup first since it seems like the most doable, easy fix that would immediately make the app easier to read.

---

## Part B: routes

| Method and path        | What it does                           | Success               | Errors       |
| ---------------------- | -------------------------------------- | --------------------- | ------------ |
|   `GET /api/visits`    |Lists all visits, most recent date first| `200` + array         | none         |
|   `POST /api/visits`   |Creates a new visit                     | `201` + created visit | `400` on restaurantId missing/not a number, date missing/wrong format, amountSpent negative/not a number, restaurantId doesn't match an existing restaurant                                                                     |
|`DELETE /api/visits/:id`|Deletes a visit                         | `204` + no body       | `404` on the visit doesn't exist                                                                                            |

**`POST /api/visits`**

```jsonc
// request
{
  "restaurantId": 1,
  "date": "2026-05-01",
  "amountSpent": 25.50,
  "notes": "Test visit"
}

// 201 response
{
  "id": 4,
  "restaurantId": 1,
  "date": "2026-05-01",
  "amountSpent": 25.5,
  "notes": "Test visit",
  "createdAt": "2026-09-09T19:28:52.180Z"
}
```

## Schema changes

none

## How I verified this

**Part A** - the contract table in CHALLENGE.md, every row including the error
cases:

```bash
# e.g.
curl -i http://localhost:3000/api/restaurants          # 200 + array
curl -i http://localhost:3000/api/restaurants/99999    # 404
curl -i http://localhost:3000/api/restaurants/abc      # 404
curl -i -X POST http://localhost:3000/api/restaurants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Out Of Range","rating":6}'              # 400
```

**Part B** - the equivalent cases for what you built:

```bash
curl -i http://localhost:3000/api/visits # 200 + array sorted by date
curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":99999,"date":"2026-05-01","amountSpent":25.50}' # 400
curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-05-01","amountSpent":25.50}' # 400
curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"not-a-date","amountSpent":25.50}' # 400
curl -i -X POST http://localhost:3000/api/visits \
  -H 'Content-Type: application/json' \
  -d '{"restaurantId":1,"date":"2026-05-01","amountSpent":-10}' # 400
curl -i -X DELETE http://localhost:3000/api/visits/4 # 204 (first delete worked)
curl -i -X DELETE http://localhost:3000/api/visits/4 # 404 (second delete of now nonexistent visit)

```

## Known issues / what I'd do next

My goal of making the app feel like something actually usable is still very unfinished. Right now, logging a visit only works for restaurants that already exist. Adding a new restaurant is a completely separate flow with no connection to logging a visit, which isn't convenient for actual use. I'd want to merge those so you could add a restaurant directly from the visit-logging form. Next, I would also want more interactivity beyond the visits form, like clicking on a restaurant in the list to expand and show more details or have something change in color or size instead of everything being in one flat list.