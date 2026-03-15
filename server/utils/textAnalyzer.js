const { keywordService } = require('../services/keywordService');

class TextAnalyzer {
  // Comprehensive text analysis
  static async analyzeText(text, options = {}) {
    const {
      includeKeywords = true,
      includeReadability = true,
      includeNGrams = true,
      keywordLimit = 10,
      nGramSize = 2,
      nGramLimit = 10
    } = options;

    try {
      const analysis = {
        basicStats: this.getBasicStats(text),
        timestamp: new Date().toISOString()
      };

      // Extract keywords
      if (includeKeywords) {
        const keywordAnalysis = await keywordService.extractKeywordsWithMetadata(text, keywordLimit);
        analysis.keywords = keywordAnalysis.keywords;
        analysis.keywordDetails = keywordAnalysis.keywordDetails;
        analysis.metrics = keywordAnalysis.metrics;
      }

      // Calculate readability
      if (includeReadability) {
        analysis.readability = keywordService.calculateReadability(text);
      }

      // Extract n-grams
      if (includeNGrams) {
        analysis.nGrams = keywordService.extractNGrams(text, nGramSize, nGramLimit);
      }

      return analysis;

    } catch (error) {
      console.error('❌ Text analysis failed:', error.message);
      throw error;
    }
  }

  // Get basic text statistics
  static getBasicStats(text) {
    try {
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
      const paragraphs = text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
      const lines = text.split('\n').filter(line => line.trim().length > 0);

      return {
        characterCount: characters,
        characterCountNoSpaces: charactersNoSpaces,
        wordCount: words.length,
        sentenceCount: sentences.length,
        paragraphCount: paragraphs.length,
        lineCount: lines.length,
        avgWordsPerSentence: sentences.length > 0 ? Math.round((words.length / sentences.length) * 100) / 100 : 0,
        avgCharsPerWord: words.length > 0 ? Math.round((charactersNoSpaces / words.length) * 100) / 100 : 0,
        avgSentencesPerParagraph: paragraphs.length > 0 ? Math.round((sentences.length / paragraphs.length) * 100) / 100 : 0
      };

    } catch (error) {
      console.error('❌ Basic stats calculation failed:', error.message);
      throw error;
    }
  }

  // Detect language (simplified)
  static detectLanguage(text) {
    try {
      const sample = text.substring(0, 1000).toLowerCase();
      
      // Simple language detection based on common words
      const languages = {
        english: ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
        spanish: ['el', 'la', 'y', 'o', 'pero', 'en', 'de', 'para', 'con', 'por', 'un', 'una'],
        french: ['le', 'la', 'et', 'ou', 'mais', 'dans', 'de', 'pour', 'avec', 'par', 'un', 'une'],
        german: ['der', 'die', 'das', 'und', 'oder', 'aber', 'in', 'zu', 'für', 'mit', 'von', 'ein']
      };

      let scores = {};
      
      for (const [lang, words] of Object.entries(languages)) {
        const matches = words.filter(word => sample.includes(word)).length;
        scores[lang] = matches;
      }

      const detectedLang = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
      const confidence = scores[detectedLang] / Math.max(...Object.values(scores));

      return {
        language: detectedLang,
        confidence: Math.round(confidence * 100),
        scores
      };

    } catch (error) {
      console.error('❌ Language detection failed:', error.message);
      return { language: 'unknown', confidence: 0, scores: {} };
    }
  }

  // Get sentiment analysis (simplified)
  static getSentiment(text) {
    try {
      const positiveWords = [
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like',
        'awesome', 'brilliant', 'outstanding', 'perfect', 'best', 'happy', 'pleased'
      ];
      
      const negativeWords = [
        'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'worst', 'sad',
        'angry', 'frustrated', 'disappointed', 'poor', 'fail', 'wrong', 'error'
      ];

      const words = text.toLowerCase().split(/\s+/);
      
      const positiveCount = words.filter(word => positiveWords.includes(word)).length;
      const negativeCount = words.filter(word => negativeWords.includes(word)).length;
      
      const totalSentimentWords = positiveCount + negativeCount;
      const sentimentScore = totalSentimentWords > 0 ? (positiveCount - negativeCount) / totalSentimentWords : 0;
      
      let sentiment = 'neutral';
      if (sentimentScore > 0.1) sentiment = 'positive';
      if (sentimentScore < -0.1) sentiment = 'negative';
      
      return {
        sentiment,
        score: Math.round(sentimentScore * 100) / 100,
        positiveWords: positiveCount,
        negativeWords: negativeCount,
        totalSentimentWords
      };

    } catch (error) {
      console.error('❌ Sentiment analysis failed:', error.message);
      return { sentiment: 'neutral', score: 0, positiveWords: 0, negativeWords: 0, totalSentimentWords: 0 };
    }
  }

  // Extract entities (simplified)
  static extractEntities(text) {
    try {
      const entities = {
        emails: [],
        urls: [],
        numbers: [],
        dates: []
      };

      // Extract emails
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      entities.emails = [...new Set(text.match(emailRegex) || [])];

      // Extract URLs
      const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
      entities.urls = [...new Set(text.match(urlRegex) || [])];

      // Extract numbers
      const numberRegex = /\b\d+\.?\d*\b/g;
      entities.numbers = [...new Set(text.match(numberRegex) || [])];

      // Extract dates (simplified)
      const dateRegex = /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/g;
      entities.dates = [...new Set(text.match(dateRegex) || [])];

      return entities;

    } catch (error) {
      console.error('❌ Entity extraction failed:', error.message);
      return { emails: [], urls: [], numbers: [], dates: [] };
    }
  }

  // Generate text summary (extractive)
  static generateSummary(text, maxSentences = 3) {
    try {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      if (sentences.length <= maxSentences) {
        return sentences.join('. ').trim();
      }

      // Simple extractive summarization based on sentence length and position
      const scoredSentences = sentences.map((sentence, index) => {
        const words = sentence.split(/\s+/).length;
        const positionScore = 1 - (index / sentences.length); // Earlier sentences get higher scores
        const lengthScore = Math.min(words / 20, 1); // Prefer sentences with moderate length
        
        return {
          sentence: sentence.trim(),
          score: positionScore * 0.6 + lengthScore * 0.4,
          index
        };
      });

      // Sort by score and take top sentences
      const topSentences = scoredSentences
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSentences)
        .sort((a, b) => a.index - b.index); // Maintain original order

      return topSentences.map(s => s.sentence).join('. ').trim();

    } catch (error) {
      console.error('❌ Summary generation failed:', error.message);
      return text.substring(0, 200) + '...';
    }
  }

  // Get text complexity metrics
  static getComplexityMetrics(text) {
    try {
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
      
      // Count complex words (more than 6 characters)
      const complexWords = words.filter(word => word.length > 6).length;
      
      // Count unique words
      const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
      
      // Calculate lexical diversity
      const lexicalDiversity = words.length > 0 ? uniqueWords / words.length : 0;
      
      // Calculate average sentence length
      const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
      
      // Complexity score (0-100)
      const complexityScore = Math.min(100, (
        (complexWords / words.length) * 40 +
        (avgSentenceLength / 20) * 30 +
        (1 - lexicalDiversity) * 30
      ) * 100);

      return {
        complexityScore: Math.round(complexityScore),
        complexWords,
        uniqueWords,
        lexicalDiversity: Math.round(lexicalDiversity * 100) / 100,
        avgSentenceLength: Math.round(avgSentenceLength * 100) / 100,
        complexity: complexityScore < 30 ? 'simple' : complexityScore < 60 ? 'moderate' : 'complex'
      };

    } catch (error) {
      console.error('❌ Complexity metrics failed:', error.message);
      return {
        complexityScore: 0,
        complexWords: 0,
        uniqueWords: 0,
        lexicalDiversity: 0,
        avgSentenceLength: 0,
        complexity: 'unknown'
      };
    }
  }
}

module.exports = { TextAnalyzer };
