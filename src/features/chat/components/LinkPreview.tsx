import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Card, CardMedia, CardContent, Link } from '@mui/material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';

interface LinkPreviewProps {
  url: string;
}

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
  const { t } = useTranslation();
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMetadata = async () => {
      try {
        // Using microlink.io API for rich link previews (free tier)
        const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (isMounted && data.status === 'success' && data.data) {
          setMetadata({
            title: data.data.title || url,
            description: data.data.description || '',
            image: data.data.image?.url || '',
            url: data.data.url || url,
          });
        } else {
          setMetadata({
            title: url,
            description: '',
            image: '',
            url,
          });
        }
      } catch {
        if (isMounted) {
          setMetadata({
            title: url,
            description: '',
            image: '',
            url,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMetadata();

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <Box
        sx={{
          mt: 1,
          p: 1.5,
          bgcolor: 'rgba(0,0,0,0.03)',
          borderRadius: 2,
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {t('chat.linkPreviewLoading')}
        </Typography>
      </Box>
    );
  }

  if (!metadata) return null;

  return (
    <Link
      href={metadata.url}
      target="_blank"
      rel="noopener noreferrer"
      underline="none"
      sx={{ display: 'block', mt: 1 }}
    >
      <Card
        sx={{
          maxWidth: 300,
          borderRadius: 2,
          border: '1px solid rgba(0,0,0,0.08)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        }}
      >
        {metadata.image && (
          <CardMedia
            component="img"
            height="140"
            image={metadata.image}
            alt={metadata.title}
            sx={{ objectFit: 'cover' }}
          />
        )}
        <CardContent sx={{ p: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'bold',
              mb: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {metadata.title}
            <OpenInNewIcon sx={{ fontSize: 14 }} />
          </Typography>
          {metadata.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {metadata.description}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
