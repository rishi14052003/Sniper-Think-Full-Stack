class KeywordService {
  // Extract keywords from text
  static async extractKeywords(text, limit = 10) {
    try {
      // Clean and normalize text
      const cleanText = this.cleanText(text);
      
      // Tokenize text
      const tokens = this.tokenize(cleanText);
      
      // Filter stop words
      const filteredTokens = this.filterStopWords(tokens);
      
      // Count word frequency
      const wordFrequency = this.countFrequency(filteredTokens);
      
      // Get top keywords
      const topKeywords = this.getTopKeywords(wordFrequency, limit);
      
      return topKeywords;
      
    } catch (error) {
      console.error('❌ Keyword extraction failed:', error.message);
      throw error;
    }
  }

  // Clean text for keyword extraction
  static cleanText(text) {
    return text
      // Convert to lowercase
      .toLowerCase()
      // Remove numbers
      .replace(/\d+/g, '')
      // Remove punctuation
      .replace(/[^\w\s]/g, ' ')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Trim
      .trim();
  }

  // Tokenize text into words
  static tokenize(text) {
    return text.split(/\s+/).filter(word => word.length > 2);
  }

  // Filter out common stop words
  static filterStopWords(tokens) {
    const stopWords = new Set([
      // Common English stop words
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
      'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
      'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we',
      'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all',
      'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
      'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make',
      'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
      'people', 'into', 'year', 'your', 'good', 'some', 'could',
      'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only',
      'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use',
      'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
      'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most',
      'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said',
      'did', 'getting', 'made', 'find', 'where', 'much', 'too', 'very',
      'still', 'being', 'going', 'why', 'before', 'never', 'here', 'more'
    ]);

    return tokens.filter(token => !stopWords.has(token));
  }

  // Count word frequency
  static countFrequency(tokens) {
    const frequency = {};
    
    tokens.forEach(token => {
      frequency[token] = (frequency[token] || 0) + 1;
    });
    
    return frequency;
  }

  // Get top keywords by frequency
  static getTopKeywords(wordFrequency, limit) {
    // Sort by frequency (descending)
    const sortedKeywords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([word, count]) => word);

    return sortedKeywords;
  }

  // Extract keywords with additional metadata
  static async extractKeywordsWithMetadata(text, limit = 10) {
    try {
      const cleanText = this.cleanText(text);
      const tokens = this.tokenize(cleanText);
      const filteredTokens = this.filterStopWords(tokens);
      const wordFrequency = this.countFrequency(filteredTokens);
      
      // Calculate additional metrics
      const totalWords = tokens.length;
      const uniqueWords = new Set(tokens).size;
      const vocabularyRichness = uniqueWords / totalWords;
      
      // Get top keywords with frequency
      const topKeywords = Object.entries(wordFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([word, count]) => ({
          word,
          count,
          frequency: count / totalWords
        }));

      return {
        keywords: topKeywords.map(k => k.word),
        keywordDetails: topKeywords,
        metrics: {
          totalWords,
          uniqueWords,
          vocabularyRichness: Math.round(vocabularyRichness * 100) / 100
        }
      };
      
    } catch (error) {
      console.error('❌ Advanced keyword extraction failed:', error.message);
      throw error;
    }
  }

  // Find keyword density
  static calculateKeywordDensity(text, keyword) {
    const cleanText = this.cleanText(text);
    const tokens = this.tokenize(cleanText);
    const totalTokens = tokens.length;
    
    const keywordCount = tokens.filter(token => token === keyword.toLowerCase()).length;
    
    return {
      count: keywordCount,
      density: totalTokens > 0 ? (keywordCount / totalTokens) * 100 : 0
    };
  }

  // Extract n-grams (phrases)
  static extractNGrams(text, n = 2, limit = 10) {
    try {
      const cleanText = this.cleanText(text);
      const tokens = this.tokenize(cleanText);
      const filteredTokens = this.filterStopWords(tokens);
      
      if (filteredTokens.length < n) {
        return [];
      }
      
      const nGrams = [];
      for (let i = 0; i <= filteredTokens.length - n; i++) {
        const nGram = filteredTokens.slice(i, i + n).join(' ');
        nGrams.push(nGram);
      }
      
      // Count n-gram frequency
      const nGramFrequency = this.countFrequency(nGrams);
      
      // Get top n-grams
      const topNGrams = Object.entries(nGramFrequency)
        .filter(([, count]) => count > 1) // Only include n-grams that appear more than once
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([nGram, count]) => nGram);
      
      return topNGrams;
      
    } catch (error) {
      console.error('❌ N-gram extraction failed:', error.message);
      throw error;
    }
  }

  // Get text readability score (simplified Flesch-Kincaid)
  static calculateReadability(text) {
    try {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0);
      
      const avgSentenceLength = words.length / sentences.length;
      const avgSyllablesPerWord = syllables / words.length;
      
      // Simplified Flesch Reading Ease Score
      const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
      
      return {
        score: Math.round(score * 100) / 100,
        level: this.getReadingLevel(score),
        avgSentenceLength: Math.round(avgSentenceLength * 100) / 100,
        avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100
      };
      
    } catch (error) {
      console.error('❌ Readability calculation failed:', error.message);
      throw error;
    }
  }

  // Count syllables in a word (simplified)
  static countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  // Get reading level from score
  static getReadingLevel(score) {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }
}

module.exports = { keywordService: KeywordService };
