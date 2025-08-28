import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Calendrier() {
  return (
    <div className="p-8 space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-primary rounded-xl shadow-glow">
          <Calendar className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Calendrier des événements
          </h1>
          <p className="text-muted-foreground">Gérez les événements paroissiaux</p>
        </div>
      </div>

      <Card className="bg-gradient-card shadow-soft">
        <CardContent className="p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">Module calendrier en cours de développement</p>
        </CardContent>
      </Card>
    </div>
  );
}