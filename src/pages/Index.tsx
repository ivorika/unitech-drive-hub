import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import LoginOptions from "@/components/LoginOptions";
import QuickInfo from "@/components/QuickInfo";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <HeroSection />
        
        {/* Search Section */}
        <section className="py-12 bg-background">
          <div className="container text-center space-y-6">
            <h2 className="text-2xl font-semibold">Quick Search</h2>
            <SearchBar />
          </div>
        </section>
        
        {/* Login Options */}
        <LoginOptions />
        
        {/* Quick Information */}
        <QuickInfo />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
