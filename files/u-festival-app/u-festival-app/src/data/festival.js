export const festivalData = {
  nl: {
    info: {
      general: {
        title: "Algemeen & contact",
        content: "Het ❤️U Festival is voor (nieuwe) studenten in de regio Utrecht en is een aanvulling op UIT.\n\nAdres: Strijkviertel, Utrecht\nNavigatieadres: Strijkviertelweg, Utrecht\n\nDatum & Openingstijden:\nZaterdag 15 augustus 2026 - 12:00 tot 23:00\nZondag 16 augustus 2026 - 12:00 tot 23:00"
      },
      accessibility: {
        title: "Bereikbaarheid",
        sections: [
          { heading: "Fiets", text: "Er is een grote gratis fietsenstalling aanwezig waar je jouw fiets de gehele dag kunt stallen." },
          { heading: "Auto", text: "Je kunt een parkingticket aanschaffen. Parkeren kan op P+R Papendorp, volg hiervoor de borden 'P online ticket'. Heb je geen ticket van te voren gekocht? Dan kun je bij de parkeerwachter op locatie een parkeerticket aanschaffen (PIN ONLY). Let wel op: VOL=VOL" },
          { heading: "OV", text: "Kom je met het openbaar vervoer? Plan dan je trip via 9292.nl." },
          { heading: "Shuttlebus", text: "Vanaf Utrecht Centraal kun je onze gratis shuttlebus richting het festivalterrein pakken. Je vindt deze bus aan de Mineurslaan. De bus rijdt tussen 12:00 en 19:00 richting het festival, en vanaf 21:00 richting het station." },
          { heading: "Taxi + Kiss & Ride", text: "Navigeer naar Strijkviertel, De Meern (Utrecht). Volg de borden 'Kiss & Ride ❤️U Festival'." }
        ]
      },
      lockers: {
        title: "Lockers",
        content: "Op het festivalterrein zijn kluisjes aanwezig waar je je spullen veilig kunt opbergen! Hier passen 3 à 4 jassen in. Je kunt je kluisje gedurende de hele dag openen en sluiten. Het is niet mogelijk om online een kluisje te reserveren."
      },
      faq: {
        title: "FAQ",
        items: [
          { q: "Ik gebruik medicatie. Wat nu?", a: "Het is toegestaan om medicijnen mee te nemen in een dosis die je maximaal nodig hebt op 1 dag. Een doktersverklaring is noodzakelijk." },
          { q: "Mag ik het festivalterrein tussentijds verlaten?", a: "Nee, helaas is dat niet mogelijk om de veiligheid van alle bezoekers te waarborgen." },
          { q: "Zijn er lockers?", a: "Yes! Op het terrein kun je medium & grote lockers huren." }
        ]
      },
      golden: {
        title: "Golden-GLU",
        content: "Studenten van het GLU hebben tijdens het festival speciale privileges en zijn herkenbaar aan een gouden armbandje. Hiermee kunnen ze gebruik maken van de gouden toiletten en bestelpunten zonder in de rij te staan."
      }
    }
  },
  en: {
    info: {
      general: {
        title: "General & contact",
        content: "The ❤️U Festival is for (new) students in the Utrecht region and is a complement to UIT.\n\nAddress: Strijkviertel, Utrecht\nNavigation: Strijkviertelweg, Utrecht\n\nDate & Opening hours:\nSaturday August 15, 2026 - 12:00 to 23:00\nSunday August 16, 2026 - 12:00 to 23:00"
      },
      accessibility: {
        title: "Getting here",
        sections: [
          { heading: "Bike", text: "There is a large free bike parking available where you can park your bike for the entire day." },
          { heading: "Car", text: "You can purchase a parking ticket. Parking is available at P+R Papendorp, follow the signs 'P online ticket'. No advance ticket? You can buy one from the parking attendant on location (PIN ONLY). Note: FULL=FULL." },
          { heading: "Public Transport", text: "Coming by public transport? Plan your trip via 9292.nl." },
          { heading: "Shuttle Bus", text: "From Utrecht Central Station you can take our free shuttle bus to the festival grounds. The bus departs from Mineurslaan. It runs between 12:00 and 19:00 towards the festival, and from 21:00 back to the station." },
          { heading: "Taxi + Kiss & Ride", text: "Navigate to Strijkviertel, De Meern (Utrecht). Follow the signs 'Kiss & Ride ❤️U Festival'." }
        ]
      },
      lockers: {
        title: "Lockers",
        content: "Lockers are available on the festival grounds where you can safely store your belongings. They fit 3 to 4 jackets. You can open and close your locker as many times as you want throughout the day. Online reservation is not possible."
      },
      faq: {
        title: "FAQ",
        items: [
          { q: "I use medication. What now?", a: "You are allowed to bring medication in the dose you need for 1 day. A doctor's certificate is required." },
          { q: "Can I leave the festival grounds temporarily?", a: "No, unfortunately this is not possible to ensure the safety of all visitors." },
          { q: "Are there lockers?", a: "Yes! You can rent medium & large lockers on site." }
        ]
      },
      golden: {
        title: "Golden-GLU",
        content: "GLU students have special privileges at the festival and are recognizable by a golden wristband. They can use the golden toilets and marked order points at the bars without waiting in line."
      }
    }
  }
}

export const schedule = {
  saturday: [
    { id: 1, stage: "Ponton", artist: "Spinvis", start: "11:00", end: "12:00", genre: "Indie" },
    { id: 2, stage: "The Lake", artist: "Stand-up Comedy", start: "10:00", end: "11:30", genre: "Comedy" },
    { id: 3, stage: "Hangar", artist: "DJ Set 1", start: "10:00", end: "12:00", genre: "House" },
    { id: 4, stage: "Ponton", artist: "Chef'Special", start: "13:00", end: "14:30", genre: "Pop" },
    { id: 5, stage: "The Club", artist: "Theatergroep X", start: "12:00", end: "13:00", genre: "Theater" },
    { id: 6, stage: "The Lake", artist: "Snelle", start: "14:00", end: "15:30", genre: "Pop" },
    { id: 7, stage: "Hangar", artist: "DJ Set 2", start: "13:00", end: "15:00", genre: "Techno" },
    { id: 8, stage: "Ponton", artist: "Davina Michelle", start: "16:00", end: "17:30", genre: "Pop" },
    { id: 9, stage: "Hangar", artist: "DJ Set 3", start: "17:00", end: "19:00", genre: "Dance" },
    { id: 10, stage: "Ponton", artist: "Headliner TBA", start: "20:00", end: "22:00", genre: "Main" },
  ],
  sunday: [
    { id: 11, stage: "Ponton", artist: "Froukje", start: "11:00", end: "12:00", genre: "Indie" },
    { id: 12, stage: "The Lake", artist: "Wetenschapsshow", start: "10:00", end: "11:30", genre: "Science" },
    { id: 13, stage: "Hangar", artist: "DJ Set 4", start: "10:00", end: "12:00", genre: "House" },
    { id: 14, stage: "Ponton", artist: "Die Antwoord", start: "14:00", end: "15:30", genre: "Pop" },
    { id: 15, stage: "The Club", artist: "Stand-up Comedy 2", start: "13:00", end: "14:00", genre: "Comedy" },
    { id: 16, stage: "The Lake", artist: "Opkomend Talent", start: "15:00", end: "16:30", genre: "Pop" },
    { id: 17, stage: "Hangar", artist: "DJ Set 5", start: "14:00", end: "16:00", genre: "Techno" },
    { id: 18, stage: "Ponton", artist: "Headliner TBA", start: "20:00", end: "22:00", genre: "Main" },
  ]
}

export const stages = ["Ponton", "The Lake", "The Club", "Hangar"]
