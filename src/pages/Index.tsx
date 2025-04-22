
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

const Index = () => {
  const [pastebinUrl, setPastebinUrl] = useState("");
  const [extractedLinks, setExtractedLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const extractUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const handleFetchPastebin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastebinUrl) {
      setError("Please enter a pastebin URL");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Create a proxy URL to avoid CORS issues
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(pastebinUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const content = await response.text();
      const links = extractUrls(content);
      
      if (links.length === 0) {
        setError("No links found in the pastebin content");
      } else {
        setExtractedLinks(links);
        setSuccess(true);
      }
    } catch (err) {
      setError("Failed to fetch the pastebin content. Please check the URL and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openLink = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-700">Pastebin Web Opener</CardTitle>
            <CardDescription>
              Extract and open links from pastebin URLs
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleFetchPastebin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="pastebinUrl" className="text-sm font-medium">
                  Pastebin URL
                </label>
                <Input
                  id="pastebinUrl"
                  type="url"
                  placeholder="https://pastebin.com/..."
                  value={pastebinUrl}
                  onChange={(e) => setPastebinUrl(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={loading}
              >
                {loading ? "Fetching..." : "Extract Links"}
              </Button>
            </form>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && extractedLinks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Extracted Links</h3>
                <div className="border rounded-md divide-y">
                  {extractedLinks.map((link, index) => (
                    <div 
                      key={index} 
                      className="p-3 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="truncate flex-1 mr-2 text-sm">
                        {link}
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => openLink(link)}
                        className="flex-shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Open link</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-xs text-gray-500">
              Note: This tool only works with public pastebin content
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
