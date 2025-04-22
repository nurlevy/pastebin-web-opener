
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [pastebinUrl, setPastebinUrl] = useState("");
  const [extractedLinks, setExtractedLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const extractUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const formatPastebinUrl = (url: string) => {
    // Check if the URL is already in raw format
    if (url.includes('pastebin.com/raw/')) {
      return url;
    }
    
    // Convert regular pastebin URLs to raw format
    // Example: https://pastebin.com/abcdef -> https://pastebin.com/raw/abcdef
    const pastebinMatch = url.match(/pastebin\.com\/([a-zA-Z0-9]+)/);
    if (pastebinMatch && pastebinMatch[1]) {
      return `https://pastebin.com/raw/${pastebinMatch[1]}`;
    }
    
    return url;
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
      // Format the URL to use the raw pastebin endpoint
      const formattedUrl = formatPastebinUrl(pastebinUrl);
      console.log("Fetching from:", formattedUrl);
      
      // Create a proxy URL to avoid CORS issues
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(formattedUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const content = await response.text();
      const links = extractUrls(content);
      
      if (links.length === 0) {
        setError("No links found in the pastebin content");
        toast({
          title: "No links found",
          description: "The pastebin content doesn't contain any links",
          variant: "destructive"
        });
      } else {
        setExtractedLinks(links);
        setSuccess(true);
        toast({
          title: "Success!",
          description: `Found ${links.length} link${links.length > 1 ? 's' : ''}`,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch the pastebin content. Make sure the URL is correct and the paste is public.");
      toast({
        title: "Error",
        description: "Failed to fetch the pastebin content. Please check the URL and try again.",
        variant: "destructive"
      });
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
                <p className="text-xs text-gray-500">
                  Use format: https://pastebin.com/YourPasteID
                </p>
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
