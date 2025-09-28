import { useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Verified } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUserTypeColor, getUserTypeLabel } from "@/lib/userUtils"; // Importando as funções de utilitário
import { FeedAuthorProfile } from "@/types/app"; // Importar FeedAuthorProfile

interface PostProps {
  id: string;
  author: FeedAuthorProfile; // Agora aceita FeedAuthorProfile
  content: string;
  images?: string[];
  postType: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

const FeedPost = ({
  id,
  author,
  content,
  images = [],
  postType,
  likes,
  comments,
  shares,
  timestamp,
  isLiked,
  onLike,
  onComment,
  onShare
}: PostProps) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  
  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return '🔄';
      case 'match_result':
        return '⚽';
      case 'training':
        return '🏃‍♂️';
      default:
        return '';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h`;
    if (hours < 168) return `${Math.floor(hours / 24)}d`;
    return date.toLocaleDateString('pt-BR');
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike();
    } finally {
      setIsLiking(false);
    }
  };
  const shouldTruncate = content.length > 300;
  const displayContent = shouldTruncate && !showFullContent 
    ? content.substring(0, 300) + "..." 
    : content;

  return (
    <Card className="w-full mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={author.avatar_url || undefined} />
              <AvatarFallback>
                {author.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{author.full_name}</h3>
                {author.verified && (
                  <Verified className="w-4 h-4 text-blue-500 fill-blue-500" />
                )}
                <Badge variant="secondary" className={`text-xs ${getUserTypeColor(author.user_type)}`}>
                  {getUserTypeLabel(author.user_type)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                @{author.full_name.toLowerCase().replace(/\s+/g, '')} · {formatTimestamp(timestamp)}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border border-border">
              <DropdownMenuItem>Reportar post</DropdownMenuItem>
              <DropdownMenuItem>Não mostrar mais posts deste usuário</DropdownMenuItem>
              <DropdownMenuItem>Copiar link</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {postType !== 'post' && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg">{getPostTypeIcon(postType)}</span>
            <Badge variant="outline" className="text-xs">
              {postType === 'transfer' && 'Transferência'}
              {postType === 'match_result' && 'Resultado da Partida'}
              {postType === 'training' && 'Treinamento'}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {displayContent}
            {shouldTruncate && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-primary ml-1"
                onClick={() => setShowFullContent(!showFullContent)}
              >
                {showFullContent ? 'Ver menos' : 'Ver mais'}
              </Button>
            )}
          </p>
          
          {images.length > 0 && (
            <div className={`grid gap-2 rounded-lg overflow-hidden ${
              images.length === 1 ? 'grid-cols-1' : 
              images.length === 2 ? 'grid-cols-2' : 
              'grid-cols-2'
            }`}>
              {images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-video bg-muted">
                  <img
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                  {images.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        +{images.length - 4} mais
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 transition-colors ${
                  isLiked ? 'text-red-600' : 'text-muted-foreground'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs">{likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onComment}
                className="flex items-center space-x-2 hover:bg-blue-50 hover:text-blue-600 transition-colors text-muted-foreground"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">{comments}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onShare}
                className="flex items-center space-x-2 hover:bg-green-50 hover:text-green-600 transition-colors text-muted-foreground"
              >
                <Share className="w-4 h-4" />
                <span className="text-xs">{shares}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedPost;