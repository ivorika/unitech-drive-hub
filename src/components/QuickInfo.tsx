import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const QuickInfo = () => {
  const infoCards = [
    {
      title: "Application Requirements",
      items: [
        "Valid learner's permit",
        "Proof of payment",
        "Profile picture upload",
        "Personal information"
      ],
      action: "View Full Requirements",
      href: "/instructions"
    },
    {
      title: "Pricing & Packages",
      items: [
        "Registration fee applies",
        "Per-lesson competitive rates",
        "Maximum 18 hours training",
        "Flexible payment options"
      ],
      action: "See Pricing Details",
      href: "/instructions"
    },
    {
      title: "Learning Process",
      items: [
        "Professional certified instructors",
        "Progress tracking dashboard",
        "Regular feedback sessions",
        "Road test preparation"
      ],
      action: "Learn More",
      href: "/about"
    },
    {
      title: "Support & Contact",
      items: [
        "Direct instructor messaging",
        "Admin support available",
        "Announcement updates",
        "24/7 online access"
      ],
      action: "Contact Us",
      href: "/contact"
    }
  ];

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Know</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started with PNGUOT Driving School. Here's what you need to begin your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {infoCards.map((card) => (
            <Card key={card.title} className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {card.items.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to={card.href}>{card.action}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickInfo;