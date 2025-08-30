import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Church, Users, Calendar, BarChart3, Shield, Heart, Globe, BookOpen, ChevronRight, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

const Index = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Gestion des Adhérents",
      description: "Gérez facilement tous les membres de votre paroisse",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Calendar,
      title: "Calendrier Paroissial",
      description: "Organisez et suivez tous les événements de l'église",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: BarChart3,
      title: "Statistiques Détaillées",
      description: "Visualisez la croissance et l'évolution de votre communauté",
      color: "from-amber-500 to-amber-600"
    },
    {
      icon: Shield,
      title: "Sécurité Garantie",
      description: "Vos données sont protégées et sécurisées",
      color: "from-green-500 to-green-600"
    }
  ];

  const testimonials = [
    {
      name: "Pasteur Rakoto",
      role: "FJKM Ambohimanga",
      content: "Cette application a révolutionné notre gestion paroissiale. Simple et efficace!",
      rating: 5
    },
    {
      name: "Mme Rasoamalala",
      role: "Secrétaire FJKM Antsirabe",
      content: "Un outil indispensable pour suivre nos membres et organiser nos activités.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="relative container mx-auto px-4 py-20">
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-gradient-primary rounded-3xl shadow-2xl animate-scale-in">
                <Church className="h-16 w-16 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              FJKM Vatomandry
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Système moderne de gestion paroissiale pour une communauté connectée
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-all transform hover:scale-105 shadow-lg">
                    Accéder au Tableau de Bord
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-all transform hover:scale-105 shadow-lg">
                      Commencer Maintenant
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="lg" variant="outline" className="border-2 hover:bg-primary/10 transition-all transform hover:scale-105">
                      Se Connecter
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Fonctionnalités Principales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-card animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="flex justify-center mb-4">
                <Heart className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Communauté</h3>
              <p className="text-muted-foreground">Renforcer les liens au sein de notre paroisse</p>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex justify-center mb-4">
                <Globe className="h-12 w-12 text-secondary animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Modernité</h3>
              <p className="text-muted-foreground">Utiliser la technologie au service de la foi</p>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex justify-center mb-4">
                <BookOpen className="h-12 w-12 text-accent animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparence</h3>
              <p className="text-muted-foreground">Une gestion claire et accessible à tous</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Témoignages
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-card border-0 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-foreground">
            Prêt à transformer votre gestion paroissiale?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/80 max-w-2xl mx-auto">
            Rejoignez les paroisses qui ont déjà modernisé leur administration
          </p>
          {!user && (
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="transform hover:scale-105 transition-all shadow-lg">
                Créer un Compte Gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto">
          <div className="text-center text-muted-foreground mb-6">
            <p className="mb-2">© 2024 FJKM Vatomandry. Tous droits réservés.</p>
            <p className="text-sm">Fait avec ❤️ pour notre communauté</p>
          </div>
          <div className="text-center text-sm text-muted-foreground/60 border-t pt-4 mt-4">
            <p className="mb-2">Technologies utilisées:</p>
            <div className="flex justify-center gap-4 text-xs">
              <span>Frontend: React.js</span>
              <span>•</span>
              <span>Backend: Supabase</span>
              <span>•</span>
              <span>Base de données: PostgreSQL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;